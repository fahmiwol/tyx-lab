# Reward & Gamification System Template

Incentivize user engagement via earned rewards (points, badges, achievements) without monetary cost to platform.

## Core Model (from a production ledger service)

```typescript
// Reward triggers — map user actions to point values
export type RewardTrigger =
  | "VIDEO_WATCH"    // 1 point per video viewed
  | "CONTENT_SHARE"  // 2 points per share (if viral)
  | "QUIZ_COMPLETE"  // 3 points per quiz finished
  | "GAME_SCORE"     // 5 points per milestone score
  | "MISSION";       // 10+ points per mission (custom override)

// Reward table: action → point value
const REWARD_TABLE: Record<RewardTrigger, number> = {
  VIDEO_WATCH:   1,
  CONTENT_SHARE: 2,
  QUIZ_COMPLETE: 3,
  GAME_SCORE:    5,
  MISSION:       10,
};

// Claim reward after user completes action
async function claimReward(
  userId: string,
  trigger: RewardTrigger,
  missionId?: string,
  customAmount?: number  // For dynamic mission payouts
): Promise<{ pointsEarned: number; newBalance: number }> {
  const pointsEarned = customAmount ?? REWARD_TABLE[trigger] ?? 1;

  return db.$transaction(async (tx) => {
    // Increment reward balance (in DB)
    const updatedBalance = await tx.rewardBalance.upsert({
      where: { userId },
      create: { userId, amount: BigInt(pointsEarned) },
      update: { amount: { increment: BigInt(pointsEarned) } }
    });

    // Audit: track earned points for compliance
    await tx.rewardAudit.create({
      data: {
        userId,
        trigger,
        amount: pointsEarned,
        missionId,
        balanceAfter: Number(updatedBalance.amount),
      }
    });

    // Check for achievement unlock
    await checkAchievements(tx, userId, updatedBalance.amount);

    return {
      pointsEarned,
      newBalance: Number(updatedBalance.amount),
    };
  });
}
```

## Schema Pattern

```sql
-- User's reward points (not money — no monetary value)
model RewardBalance {
  id        String  @id @default(cuid())
  userId    String  @unique
  amount    BigInt  @default(0)  -- total points earned
  lastEarnedAt DateTime?  -- for cadence metrics
  
  @@index([userId])
}

-- Immutable audit: every point earned
model RewardAudit {
  id            String   @id @default(cuid())
  userId        String
  trigger       String   -- "VIDEO_WATCH", "QUEST_COMPLETE", etc.
  amount        Int      -- points earned
  missionId     String?  -- link to quest/mission if applicable
  balanceAfter  Int      -- state after this transaction (for reconciliation)
  createdAt     DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([trigger])
}

-- Gamification metadata
model Achievement {
  id            String   @id @default(cuid())
  slug          String   @unique  -- "first_video", "quiz_master", "social_butterfly"
  title         String   -- "First Video Watched"
  description   String
  icon          String   -- emoji or icon URL
  threshold     Int      -- unlock at X points / Y actions
  category      String   -- "milestone", "social", "learning"
  isActive      Boolean  @default(true)
  
  @@index([category])
}

-- Track achievement unlocks per user (for leaderboards, badges)
model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
  
  achievement Achievement @relation(fields: [achievementId], references: [id])
  
  @@unique([userId, achievementId])
  @@index([userId])
}
```

## Achievement System

```typescript
interface Achievement {
  slug: string;
  title: string;
  description: string;
  category: "milestone" | "social" | "learning" | "rare";
  threshold: number;  // points required to unlock
  reward?: { bonus_points: number };  // extra points for unlocking
}

const ACHIEVEMENTS: Achievement[] = [
  {
    slug: "first_video",
    title: "Video Viewer",
    description: "Watch your first video",
    category: "learning",
    threshold: 1,
  },
  {
    slug: "quiz_master",
    title: "Quiz Master",
    description: "Complete 10 quizzes",
    category: "learning",
    threshold: 30,  // 3 points × 10 quizzes
    reward: { bonus_points: 5 },
  },
  {
    slug: "social_butterfly",
    title: "Social Butterfly",
    description: "Share content 5 times",
    category: "social",
    threshold: 10,  // 2 points × 5 shares
    reward: { bonus_points: 10 },
  },
  {
    slug: "collector",
    title: "Collector",
    description: "Earn 100 total points",
    category: "milestone",
    threshold: 100,
  },
];

// Check for achievement unlocks
async function checkAchievements(
  tx: PrismaTransaction,
  userId: string,
  currentBalance: BigInt
): Promise<void> {
  for (const achievement of ACHIEVEMENTS) {
    // Check if user already has this achievement
    const existing = await tx.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.slug
        }
      }
    });
    if (existing) continue;  // Already unlocked

    // Check if threshold met
    if (Number(currentBalance) >= achievement.threshold) {
      // Unlock achievement
      await tx.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.slug,
        }
      });

      // Award bonus if applicable
      if (achievement.reward?.bonus_points) {
        await tx.rewardBalance.update({
          where: { userId },
          data: {
            amount: { increment: BigInt(achievement.reward.bonus_points) }
          }
        });

        await tx.rewardAudit.create({
          data: {
            userId,
            trigger: "ACHIEVEMENT_BONUS",
            amount: achievement.reward.bonus_points,
            balanceAfter: Number(currentBalance) + achievement.reward.bonus_points,
          }
        });
      }

      // Notify user: "You unlocked: Quiz Master! +5 bonus points"
      await notifyUser(userId, {
        type: "achievement_unlocked",
        achievement: achievement.slug,
        title: achievement.title,
        icon: "🏆",
      });
    }
  }
}
```

## Leaderboard Query

```sql
-- Top 10 users by total points earned
SELECT
  u.id,
  u.username,
  rb.amount as total_points,
  COUNT(DISTINCT ua.achievementId) as achievement_count,
  ROW_NUMBER() OVER (ORDER BY rb.amount DESC) as rank
FROM users u
LEFT JOIN reward_balance rb ON u.id = rb.userId
LEFT JOIN user_achievement ua ON u.id = ua.userId
GROUP BY u.id, rb.amount
ORDER BY rb.amount DESC
LIMIT 10;
```

## Non-Monetary Rewards

Key rule: **Reward points are NOT money.**

```typescript
// WRONG: Converting points to cash
const idrValue = points * 1000;  // ❌ Points are not currency

// RIGHT: Points unlock features, status, or cosmetics
const benefits = {
  points_100: "Unlock premium badge",
  points_500: "Early access to new features",
  points_1000: "VIP status for 1 month",
  points_5000: "Custom username color",
};
```

Why?
1. **Simplicity:** No currency conversion logic, tax implications
2. **Compliance:** Points ≠ money (not subject to fintech regulation in most regions)
3. **Business model:** Points drive engagement without revenue cost
4. **Flexibility:** Can change point values anytime without financial impact

## Best Practices

1. **Clear value communication:** Show users exact points per action
2. **Incremental rewards:** Small actions → small points (not all-or-nothing)
3. **Milestone progression:** Celebrate achievement unlocks prominently
4. **Audit trail:** Log all points earned for chargeback defense
5. **Cooldown periods:** Prevent farming (e.g., max 1 point per video per day)
6. **Randomness:** Add subtle variance (±10% bonus chance) to maintain engagement

*Open source — use it wisely.*