# Money Math in Minor Units

## Why Not Floating Point?

```javascript
// The classic problem
0.1 + 0.2 === 0.3  // FALSE ❌

// In binary, 0.1 and 0.2 cannot be represented exactly
// Result: 0.30000000000000004
```

Financial systems must never have rounding errors. A single error compound across millions of transactions = massive fraud/loss.

## The Solution: Store Everything in Minor Units

**Definition:** The smallest divisible unit of currency.

| Currency | Major | Minor | Factor |
|----------|-------|-------|--------|
| USD | Dollar | Cent | 100 |
| IDR | Rupiah | (no formal name) | 1* |
| Bitcoin | BTC | Satoshi | 100,000,000 |
| Credit system | Token | 1 | 1 |

*Indonesia's smallest common unit is Rp 1 (no subdivision), so factor = 1.

## Practice: Convert to Minor Units on Entry

```typescript
// User input: "Rp 50.000"
const userInput = "50.000";  // String (from form)
const majorUnits = parseFloat(userInput);  // 50000
const minorUnits = majorUnits * 100;  // 5_000_000 (in cents)

// Store as BigInt (no precision loss)
await db.transaction.create({
  data: {
    amount: BigInt(minorUnits)  // 5_000_000n
  }
});

// Display: Convert back from minor to major
const displayAmount = minorUnits / 100;  // 50000
console.log(`Rp ${displayAmount.toLocaleString('id-ID')}`);  // "Rp 50.000"
```

## Common Money Operations (All in Minor Units)

### 1. Addition (same denomination)
```typescript
const balance1 = BigInt(1000);  // 10.00 dollars
const balance2 = BigInt(2500);  // 25.00 dollars
const total = balance1 + balance2;  // 3500 (35.00 dollars)
```

### 2. Fee Deduction
```typescript
const gross = BigInt(100000);  // 1000.00
const feePercent = 2.5;  // 2.5%
const feeAmount = BigInt(Math.floor(Number(gross) * feePercent / 100));  // 2500 (25.00)
const net = gross - feeAmount;  // 97500 (975.00)
```

### 3. Conversion (Different Denomination)
```typescript
// Rule: 1 Silver = 1 Bronze (in this system)
// But: Silver worth Rp 8,000 vs Bronze worth Rp 5,000 (per TierValueIDR)
const silverAmount = BigInt(100);
const exchangeRatio = 1;  // 1 Silver → 1 Bronze

const bronzeAmount = silverAmount * BigInt(exchangeRatio);
// Result: 100 Bronze
```

### 4. Rounding (Critical for Division)
```typescript
// Rule: Always round DOWN (floor) for user-facing amounts
// Rounding errors go to house/platform, not user

const total = BigInt(1000);  // 10.00
const split = 3;
const perPerson = total / BigInt(split);  // 333 (3.33), not 334
const remainder = total % BigInt(split);  // 1 (0.01) → goes to house

// Verify: 333 + 333 + 333 + 1 = 1000 ✓
```

### 5. Percentage Calculation (Safety First)
```typescript
// Correct: Always cast to Number sparingly, and only for math
const amount = BigInt(50_000_000);  // 500,000 in cents
const percent = 2.5;

// WRONG: Loses precision
// const result = BigInt(Number(amount) * percent / 100);

// RIGHT: Do math in BigInt when possible
const result = (amount * BigInt(25)) / BigInt(1000);
// 50_000_000 * 25 / 1000 = 1_250_000 (12,500.00)
```

## Tier Value Mapping (from a production ledger service)

```typescript
export const TIER_VALUE_IDR: Record<string, number> = {
  GOLD: 10_000,      // 1 Gold coin = Rp 10,000
  SILVER: 8_000,      // 1 Silver coin = Rp 8,000
  BRONZE: 5_000,   // 1 Bronze coin = Rp 5,000
  DIAMOND: 0,        // Reward coin (no monetary value)
};

// To convert: multiply amount by tier value
function getIdrValue(amount: BigInt, denomination: string): BigInt {
  const idrValue = TIER_VALUE_IDR[denomination] || 0;
  return (amount * BigInt(idrValue)) / BigInt(100);  // Convert from cents to IDR
}

const userBalance = BigInt(100);  // 100 SILVER
const idrEquivalent = getIdrValue(userBalance, "SILVER");
// (100 * 8_000) / 100 = 8_000 IDR
```

## Safeguard: Reconciliation Queries

```sql
-- Sum all debits vs credits per wallet (should always equal)
SELECT
  walletId,
  denomination,
  SUM(CASE WHEN toWalletId = walletId THEN amount ELSE 0 END) as total_credited,
  SUM(CASE WHEN fromWalletId = walletId THEN amount ELSE 0 END) as total_debited,
  (SELECT amount FROM wallet_balance WHERE id = walletId) as current_balance,
  -- Should be: total_credited - total_debited = current_balance
FROM transactions
GROUP BY walletId, denomination;
```

## Best Practices

1. **Always use BigInt for storage & arithmetic**
2. **Never use floating-point for financial calculations**
3. **Rounding always goes DOWN (floor) for user-facing amounts**
4. **Capture rounding remainders for reconciliation**
5. **Convert to major units ONLY on display**
6. **Test edge cases:** $0.01 transfers, currency conversions, fee deductions

*Open source — use it wisely.*