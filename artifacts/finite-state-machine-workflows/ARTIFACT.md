# Finite State Machine Pattern for Workflows

Model complex processes (payments, withdrawals, approvals) as state machines to prevent invalid transitions and ensure auditability.

## Core Concept

A state machine has:
1. **States:** Discrete values (PENDING, COMPLETED, FAILED, REVERSED)
2. **Transitions:** Allowed movement between states
3. **Guards:** Conditions that must be true to transition
4. **Side effects:** Actions triggered on transition (log, notify, charge, etc.)

## Example: Payment Workflow

```typescript
enum PaymentStatus {
  PENDING = "PENDING",         // Created but not yet processed
  PROCESSING = "PROCESSING",   // Submitted to payment gateway
  COMPLETED = "COMPLETED",     // Successfully settled
  FAILED = "FAILED",           // Rejected or timed out
  REVERSED = "REVERSED",       // User refund or chargeback
}

// Define valid transitions
const STATE_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]:     [PaymentStatus.PROCESSING, PaymentStatus.FAILED],
  [PaymentStatus.PROCESSING]:  [PaymentStatus.COMPLETED, PaymentStatus.FAILED],
  [PaymentStatus.COMPLETED]:   [PaymentStatus.REVERSED],  // Only path out: refund
  [PaymentStatus.FAILED]:      [],  // Terminal state
  [PaymentStatus.REVERSED]:    [],  // Terminal state
};

// Guard function: check preconditions
async function canTransition(
  currentStatus: PaymentStatus,
  targetStatus: PaymentStatus,
  context: PaymentContext
): Promise<boolean> {
  const allowedTransitions = STATE_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(targetStatus)) {
    return false;  // Invalid transition
  }

  // Extra guards for specific transitions
  if (targetStatus === PaymentStatus.REVERSED) {
    // Can only reverse if within 30 days
    const daysSinceCompletion = (Date.now() - context.completedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCompletion > 30) return false;
  }

  return true;
}

// Transition function (mutation)
async function transitionPayment(
  paymentId: string,
  targetStatus: PaymentStatus
): Promise<void> {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");

  // Check if transition is allowed
  const canMove = await canTransition(payment.status, targetStatus, payment);
  if (!canMove) {
    throw new Error(
      `Cannot transition from ${payment.status} to ${targetStatus}`
    );
  }

  // Apply transition in atomic transaction
  await db.$transaction(async (tx) => {
    // Update status
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: targetStatus, updatedAt: new Date() }
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        action: "payment.status_change",
        targetId: paymentId,
        targetType: "payment",
        payload: {
          from: payment.status,
          to: targetStatus,
        }
      }
    });

    // Side effects based on new status
    switch (targetStatus) {
      case PaymentStatus.COMPLETED:
        await notifyUser(payment.userId, `Payment completed: Rp ${payment.amount}`);
        await creditWallet(payment.userId, payment.amount);
        break;
      
      case PaymentStatus.FAILED:
        await notifyUser(payment.userId, "Payment failed. Try again.");
        break;
      
      case PaymentStatus.REVERSED:
        await debitWallet(payment.userId, payment.amount);
        await notifyUser(payment.userId, "Payment reversed.");
        break;
    }
  });
}
```

## Example: Withdrawal Approval Workflow

```typescript
enum WithdrawalStatus {
  SUBMITTED = "SUBMITTED",     // User requested
  REVIEWING = "REVIEWING",     // Admin looking at it
  APPROVED = "APPROVED",       // Admin approved
  PROCESSING = "PROCESSING",   // Bank transfer initiated
  COMPLETED = "COMPLETED",     // Funds landed in bank
  REJECTED = "REJECTED",       // Admin denied
  CANCELED = "CANCELED",       // User canceled
}

const WITHDRAWAL_TRANSITIONS: Record<WithdrawalStatus, WithdrawalStatus[]> = {
  [WithdrawalStatus.SUBMITTED]:   [WithdrawalStatus.REVIEWING, WithdrawalStatus.CANCELED],
  [WithdrawalStatus.REVIEWING]:   [WithdrawalStatus.APPROVED, WithdrawalStatus.REJECTED],
  [WithdrawalStatus.APPROVED]:    [WithdrawalStatus.PROCESSING],
  [WithdrawalStatus.PROCESSING]:  [WithdrawalStatus.COMPLETED, WithdrawalStatus.REJECTED],
  [WithdrawalStatus.COMPLETED]:   [],  // Terminal: success
  [WithdrawalStatus.REJECTED]:    [],  // Terminal: failure
  [WithdrawalStatus.CANCELED]:    [],  // Terminal: user canceled
};

// Side effects map
const SIDE_EFFECTS: Record<WithdrawalStatus, (ctx: WithdrawalContext) => Promise<void>> = {
  [WithdrawalStatus.SUBMITTED]: async (ctx) => {
    await notifyAdmins(`New withdrawal request: Rp ${ctx.amount}`);
  },
  [WithdrawalStatus.REVIEWING]: async (ctx) => {
    // Nothing special
  },
  [WithdrawalStatus.APPROVED]: async (ctx) => {
    await initiateBankTransfer(ctx.bankAccount, ctx.amount);
  },
  [WithdrawalStatus.PROCESSING]: async (ctx) => {
    // Nothing special
  },
  [WithdrawalStatus.COMPLETED]: async (ctx) => {
    await debitWallet(ctx.userId, ctx.amount);  // Actually charge them
    await notifyUser(ctx.userId, `Withdrawal completed: Rp ${ctx.amount}`);
  },
  [WithdrawalStatus.REJECTED]: async (ctx) => {
    await notifyUser(ctx.userId, `Withdrawal rejected. Funds returned.`);
  },
  [WithdrawalStatus.CANCELED]: async (ctx) => {
    await notifyUser(ctx.userId, `Withdrawal canceled.`);
  },
};
```

## Schema Pattern

```sql
model Transaction {
  id        String  @id @default(cuid())
  status    String  -- PENDING, PROCESSING, COMPLETED, FAILED, REVERSED
  
  -- Track state history
  statusHistory StatusAudit[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model StatusAudit {
  id            String   @id @default(cuid())
  transactionId String
  fromStatus    String
  toStatus      String
  reason        String?  -- why did we change state?
  actor         String?  -- who/what triggered change (admin userId, "system", "webhook")
  createdAt     DateTime @default(now())
  
  transaction Transaction @relation(fields: [transactionId], references: [id])
  
  @@index([transactionId, createdAt])
}
```

## Best Practices

1. **Make states explicit enums** (not magic strings)
2. **Define transitions upfront** (don't add runtime)
3. **Guard every transition** (validate preconditions)
4. **Log every transition** (audit trail via StatusAudit)
5. **Side effects after transaction commits** (via event queue or callbacks)
6. **Never skip states** (no direct PENDING → COMPLETED, must go through PROCESSING)

## When to Use

- Multi-step payment flows (Midtrans webhook → PROCESSING → COMPLETED)
- Withdrawal approvals (SUBMITTED → REVIEWING → APPROVED → PROCESSING → COMPLETED)
- Dispute resolution (OPEN → INVESTIGATING → RESOLVED or CHARGEBACK)
- Refund flows (REQUESTED → APPROVED → PROCESSING → COMPLETED)

*Open source — use it wisely.*
