# TTS Provider Wrapper

## Purpose
Unify TTS service APIs (OpenAI, Google Cloud, Azure) behind a single abstraction. Provides caching, rate limiting, cost tracking, and configurable output format (mp3, wav, pcm).

## Pattern
```
text + voice params
  → check cache (MD5 hash of text + voice + model)
  → if cached: return cached audio + metadata
  → else: call TTS provider
  → encode output format
  → store cache entry
  → return audio + { duration, cost, format, sampleRate }
```

## Key Responsibilities
1. **Provider Abstraction**: Unified interface for OpenAI, Google Cloud, Azure, custom TTS
2. **Caching**: In-memory or Redis-backed cache with TTL
3. **Rate Limiting**: Token bucket / sliding window per provider
4. **Cost Tracking**: Calculate & log cost per synthesis for billing
5. **Format Conversion**: Convert provider output to requested format (mp3 → wav, etc.)
6. **Streaming**: Return readable stream for large/long-form audio

## Supported Providers
- **OpenAI**: `tts-1`, `tts-1-hd` models
- **Google Cloud**: Neural2, Wavenet voices
- **Azure Cognitive Services**: Neural, neural-high-quality
- **Custom**: HTTP endpoint adapter

## Configuration

```typescript
// Environment
TTS_PROVIDER=openai | google | azure
TTS_OPENAI_KEY=...
TTS_GOOGLE_KEY=...
TTS_CACHE_REDIS_URL=...
TTS_CACHE_TTL=86400 (seconds)
```

## Cache Key Generation
```typescript
cacheKey = MD5(text + voice + model + format)
// Example: "abc123def456..." → /cache/tts/abc123def456.wav
```

## Cost Calculation
```typescript
// OpenAI: $0.015 / 1M chars (tts-1), $0.030 (tts-1-hd)
// Google: $0.000016 per 1K chars
// Azure: $0.0000167 per character
```

## Usage Example

```typescript
const wrapper = new TTSWrapper({
  provider: "openai",
  cache: "redis",
  format: "mp3",
});

const result = await wrapper.synthesize({
  text: "Hello, world!",
  voice: "alloy",
  model: "tts-1",
});

// result = {
//   audio: Buffer | ReadableStream,
//   duration: 0.85, // seconds
//   cost: 0.0000225, // USD
//   format: "mp3",
//   sampleRate: 24000,
//   cached: false,
// }
```

## Rate Limiting

```typescript
// Per provider limits
const limiter = new RateLimiter({
  provider: "openai",
  tokensPerMinute: 3500000, // chars/min
  refillInterval: 60000,
});

// Returns { allowed: bool, waitMs?: number }
const check = await limiter.check(textLength);
if (!check.allowed) {
  throw new Error(`Rate limit exceeded, wait ${check.waitMs}ms`);
}
```

## Streaming Large Audio

```typescript
// Returns ReadableStream instead of Buffer
const stream = await wrapper.synthesizeStream({
  text: "Very long text...",
  voice: "nova",
});

res.setHeader("Content-Type", "audio/mpeg");
stream.pipe(res);
```

## Error Handling
- Invalid voice/model: throw ValidationError
- Rate limit exceeded: return { allowed: false, retryAfter }
- Provider API failure: fallback to cached version or throw
- Format conversion failure: return original format + warning

## Testing Checklist
- [x] Cache hit/miss with TTL expiry
- [x] Multi-provider synthesis
- [x] Cost calculation accuracy
- [x] Rate limiter enforcement
- [x] Stream output for large text
- [x] Format conversion (mp3 ↔ wav ↔ pcm)
- [x] Error handling (invalid voice, API timeout)

*Open source — use it wisely.*
