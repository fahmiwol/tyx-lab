# BullMQ Job Enqueuer

## Purpose
Centralize job enqueueing for background task workers with standardized retry, backoff, and cleanup policies. Abstracts BullMQ configuration for common workflows (order scraping, inventory sync, shipment processing).

## Pattern
```
enqueue(jobType, payload)
  → add to queue with exponential backoff
  → retry 3× on failure
  → auto-remove on completion/failure (keep last 1000 jobs)
  → return jobId + status
```

## Key Responsibilities
1. **Retry Policy**: Exponential backoff (2s → 4s → 8s) with max 3 attempts
2. **Auto-Cleanup**: Remove completed/failed jobs after 1000 entries to prevent queue bloat
3. **Type Safety**: Enum-based job types to prevent typos
4. **Observability**: Queue name + job ID for worker logging

## Job Types (Example)
```typescript
type ShopeeJobType = "scrape_orders" | "scrape_products" | "ship_order" | "sync_inventory";

interface ShopeeJobPayload {
  accountId: string;
  orderSn?: string;
  orderId?: string;
}
```

## Configuration
```typescript
// NestJS module registration
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    BullModule.registerQueue({ name: "shopee" }),
    BullModule.registerQueue({ name: "tts_processing" }),
  ],
})
export class QueueModule {}
```

## Implementation

### Basic Usage
```typescript
const jobId = await enqueuer.enqueue("scrape_orders", {
  accountId: "12345",
});
// Returns: { id: "job-uuid", status: "queued" }
```

### Retry & Backoff Policy
- **Attempts**: 3
- **Backoff Type**: exponential
- **Initial Delay**: 2000ms
- **Formula**: delay × 2 for each retry

### Cleanup Strategy
- **removeOnComplete**: true (keep last 1000)
- **removeOnFail**: true (keep last 1000)
- Prevents unbounded queue memory growth

## Worker Pattern
```typescript
@Processor("shopee")
export class ShopeeProcessor {
  @Process("scrape_orders")
  async scrapeOrders(job: Job<ShopeeJobPayload>) {
    try {
      const { accountId, orderSn } = job.data;
      // Business logic
      return { success: true };
    } catch (error) {
      // Throw to trigger retry
      throw error;
    }
  }
}
```

## Redis Connection
- Assumes Redis available at `REDIS_URL` environment variable
- Or uses localhost:6379 by default
- BullMQ handles reconnection + durability

## Monitoring
```typescript
queue.on("completed", (job) => {
  logger.info(`Job ${job.id} completed`);
});

queue.on("failed", (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});
```

## Testing Checklist
- [x] Enqueue job with payload
- [x] Verify exponential backoff on failure
- [x] Confirm auto-cleanup after threshold
- [x] Test job ID returned
- [x] Verify Redis persistence

*Open source — use it wisely.*
