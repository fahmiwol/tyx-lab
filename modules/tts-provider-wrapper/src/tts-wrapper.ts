import { createHash } from "crypto";
import { Readable } from "stream";

export type TTSProvider = "openai" | "google" | "azure" | "custom";
export type AudioFormat = "mp3" | "wav" | "pcm" | "aac";

export interface TTSConfig {
  provider: TTSProvider;
  apiKey: string;
  cache?: "memory" | "redis";
  cacheUrl?: string;
  cacheTtl?: number; // seconds
  format: AudioFormat;
}

export interface SynthesisRequest {
  text: string;
  voice: string;
  model?: string;
  speed?: number;
}

export interface SynthesisResult {
  audio: Buffer | Readable;
  duration: number; // seconds
  cost: number; // USD
  format: AudioFormat;
  sampleRate: number;
  cached: boolean;
}

/**
 * TTS Provider Wrapper: Unified interface for multiple TTS services.
 */
export class TTSWrapper {
  private config: TTSConfig;
  private cache: Map<string, CachedAudio> | null = null;

  constructor(config: TTSConfig) {
    this.config = config;
    if (config.cache === "memory") {
      this.cache = new Map();
    }
  }

  /**
   * Generate cache key from request parameters.
   */
  private getCacheKey(req: SynthesisRequest): string {
    const key = `${req.text}:${req.voice}:${req.model || "default"}:${
      req.speed || 1.0
    }`;
    return createHash("md5").update(key).digest("hex");
  }

  /**
   * Check cache (memory or Redis).
   */
  private async checkCache(
    cacheKey: string
  ): Promise<CachedAudio | null> {
    if (this.cache) {
      const entry = this.cache.get(cacheKey);
      if (entry && entry.expiresAt > Date.now()) {
        return entry;
      }
      if (entry) {
        this.cache.delete(cacheKey);
      }
    }
    return null;
  }

  /**
   * Store in cache.
   */
  private async storeCache(
    cacheKey: string,
    audio: Buffer,
    result: SynthesisResult
  ) {
    const ttl = (this.config.cacheTtl || 86400) * 1000;
    if (this.cache) {
      this.cache.set(cacheKey, {
        audio,
        result,
        expiresAt: Date.now() + ttl,
      });
    }
  }

  /**
   * Synthesize text to speech.
   */
  async synthesize(req: SynthesisRequest): Promise<SynthesisResult> {
    const cacheKey = this.getCacheKey(req);
    const cached = await this.checkCache(cacheKey);
    if (cached) {
      return { ...cached.result, cached: true };
    }

    let audio: Buffer;
    let cost: number;
    let duration: number;

    try {
      switch (this.config.provider) {
        case "openai":
          ({ audio, cost, duration } = await this.synthesizeOpenAI(req));
          break;
        case "google":
          ({ audio, cost, duration } = await this.synthesizeGoogle(req));
          break;
        case "azure":
          ({ audio, cost, duration } = await this.synthesizeAzure(req));
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }
    } catch (error) {
      throw new Error(
        `TTS synthesis failed (${this.config.provider}): ${error.message}`
      );
    }

    const result: SynthesisResult = {
      audio,
      duration,
      cost,
      format: this.config.format,
      sampleRate: 24000,
      cached: false,
    };

    await this.storeCache(cacheKey, audio, result);
    return result;
  }

  /**
   * Synthesize and return as stream (for large text).
   */
  async synthesizeStream(req: SynthesisRequest): Promise<Readable> {
    const result = await this.synthesize(req);
    const readable = new Readable();
    readable.push(result.audio);
    readable.push(null);
    return readable;
  }

  private async synthesizeOpenAI(req: SynthesisRequest) {
    // Placeholder: call OpenAI TTS API
    // return { audio: Buffer, cost: number, duration: number }
    throw new Error("Not implemented: OpenAI integration");
  }

  private async synthesizeGoogle(req: SynthesisRequest) {
    // Placeholder: call Google Cloud TTS API
    throw new Error("Not implemented: Google integration");
  }

  private async synthesizeAzure(req: SynthesisRequest) {
    // Placeholder: call Azure Cognitive Services TTS API
    throw new Error("Not implemented: Azure integration");
  }
}

interface CachedAudio {
  audio: Buffer;
  result: SynthesisResult;
  expiresAt: number;
}

/**
 * Rate limiter for TTS provider quotas.
 */
export class TTSRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly tokensPerSecond: number;
  private readonly capacity: number;

  constructor(tokensPerMinute: number) {
    this.tokensPerSecond = tokensPerMinute / 60;
    this.capacity = tokensPerMinute;
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Check if request can proceed.
   */
  check(tokensNeeded: number): { allowed: boolean; waitMs?: number } {
    this.refill();
    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      return { allowed: true };
    }
    const shortfall = tokensNeeded - this.tokens;
    const waitMs = Math.ceil((shortfall / this.tokensPerSecond) * 1000);
    return { allowed: false, waitMs };
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.tokensPerSecond;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
