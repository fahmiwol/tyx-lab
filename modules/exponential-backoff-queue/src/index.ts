/**
 * BullMQ queue wrapper with exponential backoff retry strategy.
 *
 * Why: Job queues need smart retry logic. Exponential backoff (2s, 4s, 8s...)
 * prevents thundering herd on failures; auto-cleanup keeps queue clean.
 *
 * Usage:
 *   constructor(@InjectQueue("shopee") private q: Queue) {}
 *   await this.q.add("scrape_orders", payload, QueueConfig.defaultJobOpts());
 */

export interface BackoffStrategy {
  type: "exponential" | "fixed";
  delay: number;  // ms
  multiplier?: number;  // for exponential
}

export interface JobOptions {
  attempts: number;
  backoff: BackoffStrategy;
  removeOnComplete: number | { age: number };  // Keep for N ms or age
  removeOnFail?: number | { age: number };
  timeout?: number;  // Job timeout in ms
  priority?: number;  // Higher = sooner
}

export class QueueConfig {
  /**
   * Standard retry config: 3 attempts, exponential backoff 2s→4s→8s.
   */
  static defaultJobOpts(): JobOptions {
    return {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
        multiplier: 2,
      },
      removeOnComplete: 3600000,  // 1 hour
      removeOnFail: 86400000,      // 1 day (keep failures for audit)
      timeout: 30000,              // 30s job timeout
    };
  }

  /**
   * Aggressive retry: 5 attempts for critical jobs.
   */
  static aggressiveRetry(): JobOptions {
    return {
      ...this.defaultJobOpts(),
      attempts: 5,
    };
  }

  /**
   * No retry: fire-and-forget.
   */
  static fireAndForget(): JobOptions {
    return {
      attempts: 1,
      backoff: { type: "fixed", delay: 0 },
      removeOnComplete: 60000,
      timeout: 10000,
    };
  }
}

export class QueueHelper {
  /**
   * Enqueue job with retry strategy.
   */
  static async enqueue(
    queue: any,
    type: string,
    payload: any,
    opts?: Partial<JobOptions>,
  ) {
    const jobOpts = { ...QueueConfig.defaultJobOpts(), ...opts };
    return queue.add(type, payload, jobOpts);
  }

  /**
   * List active/waiting/failed jobs.
   */
  static async status(queue: any) {
    const [active, waiting, failed] = await Promise.all([
      queue.getActiveCount(),
      queue.getWaitingCount(),
      queue.getFailedCount(),
    ]);
    return { active, waiting, failed };
  }
}
