# Tiered Pricing & Package Resolution

Dynamic pricing based on quantity tiers or customer segments. Used for top-up packages, feature access, quota allocation.

## Pattern: Lookup Table

```typescript
// from bank-tiranyx: TOPUP_PACKAGES
export const TOPUP_PACKAGES = [
  { id: "starter",  label: "STARTER",  perak: 100,  bonus: 0,    idr: 800_000   },
  { id: "regular",  label: "REGULAR",  perak: 500,  bonus: 50,   idr: 3_800_000 },
  { id: "elite",    label: "ELITE",    perak: 1000, bonus: 150,  idr: 7_500_000 },
  { id: "ultimate", label: "ULTIMATE", perak: 5000, bonus: 1000, idr: 36_000_000},
] as const;

type PackageId = typeof TOPUP_PACKAGES[number]["id"];

// Resolution function
export function getPackage(packageId: PackageId) {
  const pkg = TOPUP_PACKAGES.find(p => p.id === packageId);
  if (!pkg) throw new Error(`Package ${packageId} not found`);
  return pkg;
}

// Calculate effective amount (quantity + bonus)
export function getEffectiveAmount(packageId: PackageId): number {
  const pkg = getPackage(packageId);
  return pkg.perak + pkg.bonus;  // 100 + 0 = 100, 500 + 50 = 550, etc.
}

// Calculate cost per unit
export function getCostPerUnit(packageId: PackageId): number {
  const pkg = getPackage(packageId);
  const effective = pkg.perak + pkg.bonus;
  return pkg.idr / effective;  // e.g., 3_800_000 / 550 = 6909 IDR per coin
}
```

## Pattern: Progressive Pricing (Quantity Discount)

```typescript
interface PricingTier {
  minQuantity: number;
  maxQuantity: number | null;  // null = unlimited
  pricePerUnit: number;
  description: string;
}

const CLOUD_STORAGE_TIERS: PricingTier[] = [
  { minQuantity: 0,    maxQuantity: 100,   pricePerUnit: 0.10,  description: "1-100 GB" },
  { minQuantity: 101,  maxQuantity: 1000,  pricePerUnit: 0.08,  description: "101-1000 GB" },
  { minQuantity: 1001, maxQuantity: null,  pricePerUnit: 0.05,  description: ">1000 GB" },
];

function resolveTier(quantity: number): PricingTier {
  const tier = CLOUD_STORAGE_TIERS.find(t => 
    quantity >= t.minQuantity && 
    (t.maxQuantity === null || quantity <= t.maxQuantity)
  );
  if (!tier) throw new Error(`Quantity ${quantity} not in any tier`);
  return tier;
}

function calculatePrice(quantity: number): number {
  const tier = resolveTier(quantity);
  return quantity * tier.pricePerUnit;
}

console.log(calculatePrice(50));    // 5.00 (tier 1)
console.log(calculatePrice(500));   // 40.00 (tier 2)
console.log(calculatePrice(2000));  // 100.00 (tier 3)
```

## Pattern: Customer Segment Pricing

```typescript
enum CustomerSegment {
  INDIVIDUAL = "INDIVIDUAL",
  SMALL_BUSINESS = "SMALL_BUSINESS",
  ENTERPRISE = "ENTERPRISE",
}

interface PricingPlan {
  segment: CustomerSegment;
  monthlyPrice: number;
  features: string[];
  apiCallsPerMonth: number;
}

const PRICING_MATRIX: PricingPlan[] = [
  {
    segment: CustomerSegment.INDIVIDUAL,
    monthlyPrice: 9,
    features: ["Basic analytics", "Email support"],
    apiCallsPerMonth: 10_000,
  },
  {
    segment: CustomerSegment.SMALL_BUSINESS,
    monthlyPrice: 49,
    features: ["Advanced analytics", "Priority support", "Custom integrations"],
    apiCallsPerMonth: 100_000,
  },
  {
    segment: CustomerSegment.ENTERPRISE,
    monthlyPrice: 0,  // Custom quote
    features: ["Full analytics", "24/7 phone support", "Dedicated account manager"],
    apiCallsPerMonth: null,  // Unlimited
  },
];

function resolvePricingPlan(segment: CustomerSegment): PricingPlan {
  const plan = PRICING_MATRIX.find(p => p.segment === segment);
  if (!plan) throw new Error(`No pricing for segment ${segment}`);
  return plan;
}

// Usage
const userSegment = CustomerSegment.SMALL_BUSINESS;
const plan = resolvePricingPlan(userSegment);
console.log(`User can make ${plan.apiCallsPerMonth} API calls/month`);
```

## Pattern: Time-Based Pricing (Proration)

Monthly subscriptions starting/ending mid-month:

```typescript
interface SubscriptionPlan {
  id: string;
  monthlyPrice: number;
  billingDayOfMonth: number;  // e.g., 1 = 1st of month
}

// Calculate daily rate
function getDailyRate(plan: SubscriptionPlan): number {
  const daysInMonth = 30;  // Simplified
  return plan.monthlyPrice / daysInMonth;
}

// Proration for partial month
function calculateProration(
  plan: SubscriptionPlan,
  startDate: Date,
  endDate: Date
): number {
  const dailyRate = getDailyRate(plan);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return dailyRate * days;
}

const plan: SubscriptionPlan = {
  id: "pro",
  monthlyPrice: 30,
  billingDayOfMonth: 1,
};

const startDate = new Date("2026-04-15");
const endDate = new Date("2026-05-01");
const prorationAmount = calculateProration(plan, startDate, endDate);
console.log(`Charge ${prorationAmount} for mid-month signup`);  // ~30.00
```

## Data Storage Pattern

```sql
-- Pricing tiers (versioned for future changes)
model PricingTier {
  id            String   @id @default(cuid())
  tier          String   -- "starter", "regular", "elite", "ultimate"
  quantity      Int      -- 100 PERAK, 500 PERAK, etc.
  bonus         Int      -- extra coins
  priceIdr      BigInt   -- 800_000, 3_800_000, etc.
  isActive      Boolean  @default(true)
  validFrom     DateTime @default(now())
  validTo       DateTime?
  
  @@unique([tier, validFrom])  -- history tracking
  @@index([isActive, validFrom])
}

-- Customer pricing (override per customer)
model CustomerPricing {
  id              String   @id @default(cuid())
  customerId      String   @unique
  segment         String   -- "INDIVIDUAL", "SMALL_BUSINESS", "ENTERPRISE"
  monthlyPrice    BigInt   -- in minor units
  customDiscount  Float?   -- 0.1 = 10% off standard pricing
  validFrom       DateTime @default(now())
  validTo         DateTime?
  
  @@index([customerId, validFrom])
}
```

## Why This Pattern?

1. **Non-code configurability:** Change tiers without redeploy (if queried from DB)
2. **A/B testability:** Run parallel pricing experiments by segment
3. **Revenue optimization:** Progressive pricing incentivizes higher purchases
4. **Audit trail:** Version pricing changes for compliance
5. **Flexibility:** One function handles all pricing logic

*Open source — use it wisely.*
