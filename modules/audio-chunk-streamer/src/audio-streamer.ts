import { Readable, PassThrough } from "stream";

export interface AudioStreamerConfig {
  chunkSize?: number; // Default: 65536 (64KB)
  interval?: number; // ms between chunks (backpressure). Default: 0 (no delay)
  mimeType?: string; // Default: audio/mpeg
}

/**
 * Stream large audio files via HTTP chunked encoding.
 * Supports range requests for pause/resume.
 */
export class AudioChunkStreamer {
  private config: AudioStreamerConfig;

  constructor(config: AudioStreamerConfig = {}) {
    this.config = {
      chunkSize: config.chunkSize || 65536,
      interval: config.interval || 0,
      mimeType: config.mimeType || "audio/mpeg",
    };
  }

  /**
   * Stream entire audio buffer.
   */
  stream(buffer: Buffer, response: any): void {
    response.setHeader("Content-Type", this.config.mimeType);
    response.setHeader("Transfer-Encoding", "chunked");
    response.setHeader("Cache-Control", "no-cache");

    this.streamChunks(buffer, 0, buffer.length, response);
  }

  /**
   * Stream partial content (range request).
   */
  streamPartial(buffer: Buffer, start: number, response: any): void {
    const end = buffer.length;
    response.setHeader("Content-Type", this.config.mimeType);
    response.setHeader("Content-Range", `bytes ${start}-${end - 1}/${buffer.length}`);

    this.streamChunks(buffer, start, end, response);
  }

  /**
   * Internal: write chunks with backpressure handling.
   */
  private streamChunks(
    buffer: Buffer,
    start: number,
    end: number,
    response: any
  ): void {
    let position = start;
    let aborted = false;

    response.on("close", () => {
      aborted = true;
    });

    response.on("error", (err: any) => {
      aborted = true;
      console.error("[AudioStreamer] Stream error:", err.message);
    });

    const writeNext = () => {
      if (aborted) return;

      if (position >= end) {
        response.end();
        return;
      }

      const chunkEnd = Math.min(position + this.config.chunkSize!, end);
      const chunk = buffer.slice(position, chunkEnd);

      const canContinue = response.write(chunk);
      position = chunkEnd;

      if (canContinue) {
        if (this.config.interval! > 0) {
          setTimeout(writeNext, this.config.interval);
        } else {
          setImmediate(writeNext);
        }
      } else {
        // Client buffer full, wait for drain
        response.once("drain", writeNext);
      }
    };

    writeNext();
  }

  /**
   * Create a readable stream from buffer.
   * Useful for piping to response or other destinations.
   */
  createReadableStream(buffer: Buffer): Readable {
    let position = 0;

    return new Readable({
      read: () => {
        if (position >= buffer.length) {
          this.push(null);
          return;
        }

        const chunkEnd = Math.min(position + this.config.chunkSize!, buffer.length);
        const chunk = buffer.slice(position, chunkEnd);
        position = chunkEnd;

        this.push(chunk);

        if (this.config.interval! > 0) {
          this.pause();
          setTimeout(() => this.resume(), this.config.interval);
        }
      },
    });
  }
}

/**
 * Parse Range header.
 * @param rangeHeader "bytes=0-1024" or "bytes=1024-"
 * @param totalLength Total file size
 * @returns { start, end } or null if invalid
 */
export function parseRangeHeader(
  rangeHeader: string,
  totalLength: number
): { start: number; end: number } | null {
  if (!rangeHeader || !rangeHeader.startsWith("bytes=")) return null;

  const range = rangeHeader.slice(6);
  const [startStr, endStr] = range.split("-");

  let start = parseInt(startStr, 10) || 0;
  let end = parseInt(endStr, 10) || totalLength - 1;

  if (start > end || start < 0 || end >= totalLength) {
    return null;
  }

  return { start, end: end + 1 }; // end is exclusive
}

/**
 * Express middleware for Range request support.
 */
export function createRangeMiddleware() {
  return (req: any, res: any, next: any) => {
    res.locals.parseRange = (totalLength: number) => {
      const rangeHeader = req.headers.range;
      return parseRangeHeader(rangeHeader, totalLength);
    };
    next();
  };
}
