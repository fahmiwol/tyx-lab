# Audio Chunk Streamer

## Purpose
Stream large audio files to clients over HTTP with chunked transfer encoding, range request support (pause/resume), and adaptive chunk sizing for bandwidth optimization.

## Pattern
```
audio buffer → determine chunk size → open HTTP stream
  → write chunks with configurable interval
  → support Range header (206 Partial Content)
  → handle client abort (cleanup, stop streaming)
```

## Key Responsibilities
1. **Chunked Encoding**: Transfer-Encoding: chunked for real-time streaming
2. **Range Requests**: HTTP 206 responses for pause/resume (RFC 7233)
3. **MIME Type Handling**: Correct Content-Type for audio/mpeg, audio/wav, audio/ogg
4. **Backpressure Handling**: Respect client read speed to avoid memory bloat
5. **Abort Cleanup**: Graceful shutdown when client disconnects

## HTTP Headers

### Normal Streaming
```
HTTP/1.1 200 OK
Content-Type: audio/mpeg
Transfer-Encoding: chunked
Content-Encoding: identity
Cache-Control: no-cache
```

### Range Request (Pause/Resume)
```
GET /audio HTTP/1.1
Range: bytes=65536-

HTTP/1.1 206 Partial Content
Content-Type: audio/mpeg
Content-Length: 1000000
Content-Range: bytes 65536-1065535/1065536
```

## Configuration

```env
# Streaming defaults
AUDIO_CHUNK_SIZE=65536        # 64KB per chunk
AUDIO_STREAM_INTERVAL=100     # ms between chunks
MAX_BUFFERED_CHUNKS=5         # Backpressure limit
```

## Usage Examples

### Express.js
```typescript
import { AudioChunkStreamer } from "./audio-chunk-streamer";

app.get("/api/audio/:id", async (req, res) => {
  const audioBuffer = await fetchAudioFromDB(req.params.id);
  
  const streamer = new AudioChunkStreamer({
    chunkSize: 65536,
    mimeType: "audio/mpeg",
  });

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  streamer.stream(audioBuffer, res);
});

// Range request support
app.get("/api/audio/:id", async (req, res) => {
  const audioBuffer = await fetchAudioFromDB(req.params.id);
  const range = req.headers.range;

  if (range) {
    const start = parseInt(range.replace(/bytes=/, "").split("-")[0], 10);
    const streamer = new AudioChunkStreamer({ chunkSize: 65536 });
    
    res.writeHead(206, {
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length - start,
      "Content-Range": `bytes ${start}-${audioBuffer.length - 1}/${audioBuffer.length}`,
    });
    
    streamer.streamPartial(audioBuffer, start, res);
  } else {
    // Stream full file
    const streamer = new AudioChunkStreamer({ chunkSize: 65536 });
    res.setHeader("Content-Type", "audio/mpeg");
    streamer.stream(audioBuffer, res);
  }
});
```

### FastAPI
```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

@app.get("/api/audio/{audio_id}")
async def stream_audio(audio_id: str, request: Request):
    audio_buffer = await fetch_audio_from_db(audio_id)
    
    async def generate():
        chunk_size = 65536
        for i in range(0, len(audio_buffer), chunk_size):
            chunk = audio_buffer[i:i + chunk_size]
            yield chunk
            await asyncio.sleep(0.01)  # Backpressure
    
    return StreamingResponse(
        generate(),
        media_type="audio/mpeg",
        headers={
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache",
        }
    )
```

## Backpressure Handling

```typescript
// Pause streaming if client buffer full
stream.on("drain", () => {
  // Resume writing
});

// If client aborts
stream.on("close", () => {
  streamer.abort(); // Cleanup
});
```

## Performance Tuning

| Scenario | Chunk Size | Interval | Notes |
|----------|-----------|----------|-------|
| LTE/4G | 32-64KB | 50-100ms | Balanced |
| WiFi | 128-256KB | 10-50ms | Higher throughput |
| Slow 3G | 16-32KB | 100-200ms | Lower memory |
| Large file | 256-512KB | 10ms | Fast pipe |

## Testing Checklist
- [x] Stream audio without buffering full file
- [x] Range request (partial content 206)
- [x] Client abort cleanup
- [x] Correct Content-Type headers
- [x] Backpressure (drain event)
- [x] Connection timeout handling
- [x] Multiple simultaneous streams

## MIME Types
- `audio/mpeg` → MP3
- `audio/wav` → WAV
- `audio/ogg` → OGG Vorbis
- `audio/aac` → AAC
- `audio/flac` → FLAC
- `audio/webm` → WebM

*Open source — use it wisely.*
