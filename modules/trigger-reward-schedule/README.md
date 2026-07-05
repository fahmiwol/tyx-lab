# Trigger-Based Reward Schedule

**Problem:** Gamification apps reward users on multiple triggers (watch video, complete quiz, finish mission). Each trigger needs a default amount, icon, description. One-off adjustments (bonus, penalty) needed per-transaction without modifying base table.

**Solution:** Immutable reward lookup table:

| Trigger | Label | Default | Icon |
|---------|-------|---------|------|
| VIDEO_WATCH | Watch Video | 1 | 📹 |
| QUIZ_COMPLETE | Complete Quiz | 3 | 🧠 |
| MISSION | Mission Complete | 10 | ⚔️ |

Supports customAmount override at call-time for bonuses/penalties.

## Interface

```typescript
interface RewardRow {
  trigger: string;
  label: string;
  defaultAmount: number;
  icon: string;
  description: string;
}

async function awardByTrigger(
  userId: string,
  trigger: string,
  customAmount?: number
): Promise<{ txId, awardedAmount, timestamp }>;
```

## Usage

```typescript
// Standard reward
await awardByTrigger('user_123', 'QUIZ_COMPLETE');
// Awards 3 Berlian (default)

// With bonus
await awardByTrigger('user_123', 'QUIZ_COMPLETE', 5);
// Awards 5 Berlian (override)

// With penalty
await awardByTrigger('user_123', 'MISSION', -2);
// Deducts 2 Berlian (cheat detection)
```

## Key Patterns

- **Version-safe:** Base table is code-controlled, immutable across builds
- **Override logging:** Every customAmount recorded with reason field
- **Trigger-namespaced:** Prevents collision (e.g., VIDEO_WATCH vs VIDEO_COMPLETE)
- **Ledger-linked:** Each award creates CoinHistory entry for audit

## Configuration

Base table lives in code (e.g., reward.service.ts):
```typescript
const REWARD_TABLE = [
  { trigger: 'VIDEO_WATCH', defaultAmount: 1, icon: '📹', ... },
  ...
];
```

To change: Edit source + deploy. Triggers are contract between client + backend.

*Open source — use it wisely.*
