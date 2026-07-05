# Pricing Plans Schema — Template

Standardized JSON schema for SaaS pricing plans (free, pro, enterprise, custom).

## Why This Exists

Every SaaS needs to define pricing tiers. Instead of inventing the structure each time, use this template.

Extracted from 3 Tiranyx SaaS products (an HR/CRM app, a document vault, a project-management app) — they all settled on the same pattern:
- Tier ID + name
- Price (in minor units: IDR, cents)
- Billing period
- Feature list
- UI highlighting (which plan to promote)
- Call-to-action text

This artifact standardizes that consensus.

## The Schema

```json
{
  "pricingPlans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "period": "selamanya",
      "features": [
        "10 documents",
        "100MB storage",
        "Format PDF/DOC/XLS",
        "Share link",
        "Email support"
      ],
      "highlighted": false,
      "cta": "Mulai Gratis"
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 199000,
      "period": "bulan",
      "features": [
        "1.000 documents",
        "10GB storage",
        "OCR auto-extract",
        "Document versioning",
        "E-signature",
        "Priority support"
      ],
      "highlighted": true,
      "cta": "Pilih Pro"
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 499000,
      "period": "bulan",
      "features": [
        "Unlimited documents",
        "100GB storage",
        "Team collaboration",
        "Audit trail",
        "API access",
        "White-label",
        "Dedicated support"
      ],
      "highlighted": false,
      "cta": "Pilih Enterprise"
    }
  ]
}
```

## Field Definitions

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique slug: `free`, `pro`, `enterprise`, etc. |
| `name` | string | Display name: "Free", "Pro", "Enterprise" |
| `price` | number | In smallest currency unit (e.g., IDR, USD cents). 0 = free tier. |
| `period` | string | Billing period: `selamanya` (forever), `bulan` (month), `tahun` (year), `jam` (hourly) |
| `features` | string[] | 4–8 feature bullets. Concise, benefit-focused. |
| `highlighted` | boolean | Which plan to visually emphasize (usually `pro` tier). |
| `cta` | string | Call-to-action button text: "Mulai Gratis", "Pilih Pro", "Hubungi Sales" |

## Usage Examples

### Storing in Admin Store

```typescript
const adminStore = new JsonStore('/data/admin.json', {
  users: [],
  subscriptions: [],
  settings: {
    appName: 'MyApp',
    pricingPlans: [
      { id: 'free', name: 'Free', price: 0, period: 'selamanya', features: [...], highlighted: false, cta: 'Start Free' },
      { id: 'pro', name: 'Pro', price: 29900, period: 'bulan', features: [...], highlighted: true, cta: 'Choose Pro' },
      // ...
    ]
  }
});
```

### Frontend: Render Plans

```typescript
// React example
const settings = adminStore.read().settings;

return (
  <div className="pricing-grid">
    {settings.pricingPlans.map(plan => (
      <div key={plan.id} className={plan.highlighted ? 'highlighted' : ''}>
        <h2>{plan.name}</h2>
        <p className="price">
          {plan.price > 0 ? `${plan.price.toLocaleString()} / ${plan.period}` : 'Free'}
        </p>
        <ul>
          {plan.features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
        <button>{plan.cta}</button>
      </div>
    ))}
  </div>
);
```

### Backend: Resolve Plan Details

```typescript
function getPlanById(planId) {
  const settings = adminStore.read().settings;
  return settings.pricingPlans.find(p => p.id === planId);
}

app.post('/api/checkout', requireAuth, (req, res) => {
  const { planId } = req.body;
  const plan = getPlanById(planId);
  
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  
  // Create subscription
  const subscription = {
    id: crypto.randomUUID(),
    userId: req.session.userId,
    planId: plan.id,
    amount: plan.price,
    period: plan.period,
    status: 'active',
    createdAt: new Date().toISOString(),
    renewsAt: calculateRenewalDate(plan.period)
  };
  
  adminStore.update(d => {
    d.subscriptions.push(subscription);
    return d;
  });
  
  res.json(subscription);
});
```

## Variations

### Multi-Region Pricing

```json
{
  "id": "pro",
  "name": "Pro",
  "pricing": {
    "IDR": { "amount": 199000, "period": "bulan" },
    "USD": { "amount": 14.99, "period": "month" },
    "EUR": { "amount": 13.99, "period": "month" }
  },
  "features": [...]
}
```

### Addons / Usage-Based

```json
{
  "id": "pro-plus",
  "name": "Pro+",
  "price": 299000,
  "period": "bulan",
  "baseFeatures": [...],
  "addons": [
    { "id": "extra-storage", "name": "Extra 100GB", "price": 49000, "period": "bulan" },
    { "id": "concurrent-users", "name": "+5 Users", "price": 99000, "period": "bulan" }
  ]
}
```

## Real-World Examples from Tiranyx

**an HR/CRM app (HR/CRM):**
- Free: 10 employees, basic dashboard
- Pro: 100 employees, payroll, absensi
- Enterprise: unlimited, BPJS sync, custom reports

**a document vault (Document Vault):**
- Free: 10 documents, 100MB
- Pro: 1,000 documents, 10GB, OCR
- Business: unlimited, team, API

**a project-management app (Project Manager):**
- Free: 3 projects, 20 tasks
- Pro: 50 projects, Gantt, reporting
- Enterprise: unlimited, budget tracking, contractor portal

## Notes

- Always store prices in smallest currency unit (no floats)
- `highlighted: true` should be exactly one plan
- Feature lists should be 4–8 bullets (too many = clutter)
- Period names should match your language (support i18n later)
- CTA text drives conversion — test variations

*Open source — use it wisely.*