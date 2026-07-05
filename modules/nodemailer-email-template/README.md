# Nodemailer Email Template

SMTP email dispatch via nodemailer. Graceful fallback if unconfigured. Pre-built templates for purchase, reset, invite flows.

## Why

- **SMTP abstraction**: Works with Gmail, SendGrid, Amazon SES, custom SMTP
- **Graceful fallback**: If `SMTP_HOST` not set, logs and returns `{ ok: true, skipped: true }`
- **Built-in templates**: Common SaaS emails ready to use
- **Singleton transport**: Reused across requests (efficient connection pooling)

## Setup

### 1. Environment Variables

```bash
# Gmail with App Password (recommended for dev/small projects)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Generate in Google Account
SMTP_FROM=Your App <noreply@example.com>

# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxx

# Amazon SES
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Your App <info@yourdomain.com>
```

### 2. Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com) → Security
2. Enable 2-factor authentication
3. Search "App passwords" → select Mail + Windows Computer
4. Copy the 16-char password
5. Paste into `SMTP_PASS` (remove spaces)

## Usage

```typescript
import { sendEmail, tplPurchaseSuccess } from '@/lib/nodemailer-email-template';

// Send custom email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Migancore',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
});

// Send with built-in template
const email = tplPurchaseSuccess({
  buyerName: 'John Doe',
  productName: 'Premium Bundle',
  orderId: 'ORD-12345',
  downloadUrl: 'https://example.com/downloads/ORD-12345',
  amountIdr: 500000,
});

await sendEmail({
  ...email,
  to: 'john@example.com',
});
```

## Built-in Templates

### tplPurchaseSuccess

Purchase confirmation with order details and download link.

```typescript
await sendEmail({
  ...tplPurchaseSuccess({
    buyerName: 'Alice',
    productName: 'Coffee Mug',
    orderId: 'ORD-999',
    downloadUrl: 'https://example.com/dl/ORD-999',
    amountIdr: 150000,
  }),
  to: 'alice@example.com',
});
```

Output: Professional HTML email with branding, order info, CTA button.

### tplPasswordReset

Password reset link with expiry notice.

```typescript
await sendEmail({
  ...tplPasswordReset({
    recipientName: 'Bob',
    resetUrl: 'https://example.com/reset/token-xyz',
    expiryMinutes: 60,
  }),
  to: 'bob@example.com',
});
```

## API Route Example

```typescript
// app/api/auth/register/route.ts
import { sendEmail, tplPasswordReset } from '@/lib/nodemailer-email-template';

export async function POST(request: Request) {
  const { email, name, resetToken } = await request.json();

  // Generate reset link
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset/${resetToken}`;

  // Send email
  const result = await sendEmail({
    ...tplPasswordReset({
      recipientName: name,
      resetUrl,
      expiryMinutes: 24 * 60, // 1 day
    }),
    to: email,
  });

  if (!result.ok) {
    console.error('Email failed:', result.error);
    return Response.json({ error: 'Could not send email' }, { status: 500 });
  }

  if (result.skipped) {
    console.warn('Email skipped (SMTP not configured)');
  }

  return Response.json({ ok: true });
}
```

## Custom Templates

Add your own:

```typescript
export interface WelcomeOpts {
  userName: string;
  dashboardUrl: string;
}

export function tplWelcome(opts: WelcomeOpts): EmailPayload {
  return {
    to: '', // Caller sets this
    subject: 'Welcome to Migancore!',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <h1>Hi ${opts.userName}! 👋</h1>
        <p>Your account is ready. Access your dashboard:</p>
        <a href="${opts.dashboardUrl}" style="...">Go to Dashboard</a>
      </div>`,
  };
}
```

Then use:

```typescript
await sendEmail({
  ...tplWelcome({ userName: 'Alice', dashboardUrl: 'https://app.example.com' }),
  to: 'alice@example.com',
});
```

## Graceful Fallback

If `SMTP_HOST` is not set:

```typescript
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Test',
  html: '<p>Hello</p>',
});

// result: { ok: true, skipped: true }
// Logs: "[mailer] SMTP not configured — skipped: "Test" → user@example.com"
```

Perfect for **dev/test environments** where email isn't needed.

## Error Handling

```typescript
const result = await sendEmail({...});

if (!result.ok && !result.skipped) {
  console.error('Send failed:', result.error);
  // Handle: retry, log, alert, etc.
}
```

Common errors:
- **Authentication failed**: Check SMTP_USER, SMTP_PASS
- **Host not found**: Check SMTP_HOST, SMTP_PORT
- **Rate limited**: SMTP provider throttling (SendGrid, Gmail daily limits)

## Performance

- **Singleton transport**: Created once, reused (efficient)
- **Async**: Non-blocking via `nodemailer.sendMail()`
- **Text generation**: Auto-strips HTML if `text` not provided

For high volume (1000+ emails/min), consider:
1. Background queue (BullMQ, RabbitMQ)
2. Transactional email service (SendGrid, Mailgun, AWS SES)
3. Batch templates (merge mail)

## Related Modules

- `tiered-quota-resolver`: Rate-limit email sends per user
- `password-scrypt-hash`: Send reset with hashed token
- `aes-256-gcm-secret`: Encrypt sender credentials

*Open source — use it wisely.*
