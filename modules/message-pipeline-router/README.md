# Message Pipeline Router

## Purpose
Orchestrate multi-channel inbound messages (WhatsApp, Telegram, SMS) through a unified processing pipeline. Handles webhook verification, message ingestion, intent detection, and outbound reply routing.

## Pattern
```
webhook entry → normalize phone/text → find/create conversation → classify intent
  → log processing state → dispatch to action handler → send reply
```

## Key Responsibilities
1. **Channel Abstraction**: Accepts messages from different webhook sources (Meta API, Telegram Bot API, Twilio)
2. **Intent Parsing**: First tries rule-based matching (regex patterns), then LLM fallback (OpenRouter, Gemini)
3. **Conversation Tracking**: Maintains conversation state per (user, channel, optional external ref)
4. **Processing Log**: Records intent, confidence, status for observability and debugging
5. **Error Handling**: Graceful fallback if intent parsing fails; logs to DB

## Data Flow

### Inbound DTO
```typescript
interface InboundMessageDto {
  phone: string;           // Canonical E.164 format
  text: string;            // Message body
  channel: Channel;        // wa | telegram | sms
  externalRef?: string;    // Webhook message ID
  rawPayload?: object;     // Full webhook payload for debugging
}
```

### Processing Output
- `reply: string` — Response to send back to user
- `messageId: UUID` — Stored inbound message ID
- `conversationId: UUID` — Conversation context
- `processingLogId: UUID` — Audit trail with intent & confidence

## Implementation Notes

### Conversation Creation
- Fetches existing conversation by (userId, channel, externalRef)
- Falls back to creating new conversation if not found
- Ensures message deduplication on retry

### Intent Classification
1. **Rule-based**: Regex patterns for common commands (order, invoice, etc.)
2. **LLM fallback chain**:
   - Try OpenRouter first (if configured)
   - Fall back to Gemini (if configured)
   - Last resort: Gemma (offline inference)
3. **Confidence scoring**: Each result includes confidence [0..1]

### Action Dispatcher
- Receives parsed intent + raw text + channel context
- Routes to business logic (inventory lookup, order creation, etc.)
- Returns structured reply text

## Configuration
```env
# LLM providers for intent inference
OPENROUTER_API_KEY=...
GEMINI_API_KEY=...
GEMMA_MODEL_PATH=...

# Webhook verification
META_VERIFY_TOKEN=...
TELEGRAM_BOT_TOKEN=...
```

## Dependencies
- Prisma ORM (message/conversation/log storage)
- NestJS/FastAPI (HTTP framework)
- LLM clients (OpenRouter, Gemini APIs)

## Error Scenarios
- Invalid webhook signature: reject with 403
- LLM inference timeout: fallback to generic reply
- Phone number parsing fail: log and skip message
- Missing channel config: return { ok: true, ignored: true }

## Testing Checklist
- [x] Webhook verification challenge
- [x] Multi-channel inbound normalization
- [x] Conversation deduplication
- [x] Intent parsing with LLM fallback
- [x] Processing log audit trail
- [x] Error handling on reply dispatch

*Open source — use it wisely.*
