import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, Job } from "bullmq";

/**
 * Job type enum to prevent typos in enqueue calls.
 */
export type JobType = 
  | "scrape_orders"
  | "scrape_products"
  | "sync_inventory"
  | "ship_order"
  | "process_tts"
  | "generate_audio";

export interface JobResult {
  id: string;
  status: "queued";
}

/**
 * Abstract job payload interface for inheritance.
 */
export interface JobPayload {
  accountId?: string;
  [key: string]: any;
}

@Injectable()
export class QueueEnqueuerService {
  private readonly log = new Logger(QueueEnqueuerService.name);

  constructor(@InjectQueue("worker") private readonly queue: Queue) {}

  /**
   * Enqueue a job with standardized retry + backoff policy.
   * 
   * @param type Job type identifier
   * @param payload Job-specific data
   * @returns Job ID and initial status
   */
  async enqueue(type: JobType, payload: JobPayload): Promise<JobResult> {
    try {
      const job = await this.queue.add(type, payload, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000, // 2s, 4s, 8s for retries
        },
        removeOnComplete: {
          age: 3600, // Remove after 1 hour
        },
        removeOnFail: false, // Keep failed jobs for debugging
      });

      this.log.debug(
        `Enqueued job ${type}:${job.id} with payload: ${JSON.stringify(payload)}`
      );

      return {
        id: job.id,
        status: "queued",
      };
    } catch (error) {
      this.log.error(`Failed to enqueue job ${type}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get job status by ID.
   */
  async getJobStatus(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;
    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts,
    };
  }

  /**
   * Remove job from queue (for cancellation).
   */
  async cancelJob(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  }

  /**
   * Get queue stats.
   */
  async getQueueStats() {
    return {
      waiting: await this.queue.getWaitingCount(),
      active: await this.queue.getActiveCount(),
      completed: await this.queue.getCompletedCount(),
      failed: await this.queue.getFailedCount(),
      delayed: await this.queue.getDelayedCount(),
    };
  }
}
