# Autonomous Task Lifecycle & State Persistence

Persist task state through lifecycle: pending → started → running → done/failed. JSON storage + Socket.io live updates for UI. Includes retry logic, circuit breaker, and timeout handling.

## State Machine

pending → started → running → done
Failed state branches to: retrying → running (if retries < limit) → permanent_error

## Core Pattern

### Task Definition
- ID, name, async handler function
- State: one of [pending, started, running, done, failed, retrying, paused, permanent_error]
- Metadata: startedAt, completedAt, error, result, retryCount

### Persistence
- Write task JSON to .data/tasks/${taskId}.json after each state change
- Enables recovery on restart
- Atomic writes avoid corruption

### Events
- Emit task:state-change on Socket.io for live UI
- Listeners update dashboard in real-time

### Retry Logic
- Exponential backoff: delay = 1000 * 2^retryCount
- Max retries configurable (default 3)
- After limit exceeded → permanent_error state

### Timeout
- Wrap handler in Promise.race with timeout
- Default 60s, configurable per task

### Circuit Breaker (Optional)
- Track failure count per module/agent
- After N failures, skip for cooldown period
- Graceful degradation instead of cascade failure

## Benefits
1. Resilient: auto-retry with exponential backoff
2. Observable: live updates + full history
3. Recoverable: JSON persistence
4. Debuggable: every state change + error logged
5. Scalable: works for 10s concurrent tasks

*Open source — use it wisely.*
