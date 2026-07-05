import { Injectable, Logger } from "@nestjs/common";

export enum Channel {
  wa = "wa",
  telegram = "telegram",
  sms = "sms",
}

export enum MessageDirection {
  in = "in",
  out = "out",
}

export interface InboundMessageDto {
  phone: string;
  text: string;
  channel: Channel;
  externalRef?: string;
  rawPayload?: object;
}

export interface ParsedIntent {
  intent: string;
  confidence: number;
  params?: Record<string, string>;
}

export interface ProcessingResult {
  reply: string;
  conversationId: string;
  messageId: string;
  processingLogId: string;
}

@Injectable()
export class MessagePipelineService {
  private readonly log = new Logger(MessagePipelineService.name);

  constructor(
    private readonly ruleEngine: any, // RuleEngineService
    private readonly aiInference: any, // LLM service
    private readonly actionRouter: any, // ActionRouterService
    private readonly db: any, // Database ORM
  ) {}

  /**
   * Find or create conversation for (userId, channel, externalRef) tuple.
   * Deduplicates on webhook retry by checking externalRef.
   */
  private async findOrCreateConversation(params: {
    userId: string;
    channel: Channel;
    externalRef?: string;
  }) {
    const existing = await this.db.conversation.findFirst({
      where: {
        userId: params.userId,
        channel: params.channel,
        externalRef: params.externalRef ?? null,
      },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return existing;
    return this.db.conversation.create({
      data: {
        userId: params.userId,
        channel: params.channel,
        externalRef: params.externalRef,
      },
    });
  }

  /**
   * Parse intent via rule-based matching, then LLM fallback chain.
   * @returns ParsedIntent or null if confidence too low
   */
  private async classifyIntent(text: string): Promise<ParsedIntent | null> {
    // Try rule-based first
    let parsed = this.ruleEngine.tryMatch(text);
    if (parsed) return parsed;

    // LLM fallback chain: OpenRouter → Gemini → Gemma
    try {
      parsed = await this.aiInference.infer(text);
      if (parsed?.intent !== "unknown") return parsed;
    } catch (e) {
      this.log.warn(`AI inference failed: ${e.message}`);
    }

    return null;
  }

  /**
   * Main handler: ingest message → parse intent → dispatch action → reply
   */
  async handleInbound(dto: InboundMessageDto): Promise<ProcessingResult> {
    // Resolve user from phone number
    const user = await this.actionRouter.resolveUser(dto.phone);

    // Find or create conversation
    const conversation = await this.findOrCreateConversation({
      userId: user.id,
      channel: dto.channel,
      externalRef: dto.externalRef,
    });

    // Store inbound message
    const inbound = await this.db.message.create({
      data: {
        conversationId: conversation.id,
        direction: MessageDirection.in,
        body: dto.text,
        rawPayload: dto.rawPayload ?? {},
      },
    });

    // Classify intent
    let parsed = await this.classifyIntent(dto.text);
    if (!parsed) {
      parsed = { intent: "unknown", confidence: 0, params: {} };
    }

    // Log processing
    const processingLog = await this.db.messageProcessingLog.create({
      data: {
        messageId: inbound.id,
        parsedIntent: parsed.intent,
        confidence: parsed.confidence,
        status: "pending",
      },
    });

    // Dispatch action and get reply
    let reply = "I didn't understand that. Please try again.";
    try {
      const result = await this.actionRouter.execute({
        userId: user.id,
        parsed,
        rawText: dto.text,
        channel: dto.channel,
      });
      reply = result.reply || reply;

      // Mark processing as complete
      await this.db.messageProcessingLog.update({
        where: { id: processingLog.id },
        data: { status: "complete" },
      });
    } catch (error) {
      this.log.error(`Action dispatch failed: ${error.message}`);
      await this.db.messageProcessingLog.update({
        where: { id: processingLog.id },
        data: { status: "error", errorMessage: error.message },
      });
    }

    return {
      reply,
      conversationId: conversation.id,
      messageId: inbound.id,
      processingLogId: processingLog.id,
    };
  }
}
