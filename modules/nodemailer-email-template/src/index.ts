import nodemailer from 'nodemailer';

/**
 * Email dispatch via nodemailer + SMTP relay.
 * Graceful skip if SMTP_HOST not configured.
 * Includes built-in templates for common flows.
 *
 * Required env vars:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=sender@example.com
 *   SMTP_PASS=app-specific-password
 *   SMTP_FROM=Your App <noreply@example.com>
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

/** Singleton transporter (created once per process) */
let _transport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport(): ReturnType<typeof nodemailer.createTransport> | null {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;

  if (!_transport) {
    _transport = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return _transport;
}

/**
 * Send email via SMTP.
 * Returns { ok: true, skipped: true } if SMTP not configured.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const transport = getTransport();

  if (!transport) {
    console.info(
      `[mailer] SMTP not configured — skipped: "${payload.subject}" → ${payload.to}`
    );
    return { ok: true, skipped: true };
  }

  try {
    const from =
      process.env.SMTP_FROM ??
      `Noreply <${process.env.SMTP_USER ?? 'noreply@example.com'}>`;

    await transport.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text:
        payload.text ??
        payload.html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    });

    console.info(
      `[mailer] sent: "${payload.subject}" → ${payload.to}`
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[mailer] send failed:', msg);
    return { ok: false, error: msg };
  }
}

// ─── Built-in Templates ─────────────────────────────────────────────────

export interface PurchaseSuccessOpts {
  buyerName: string;
  productName: string;
  orderId: string;
  downloadUrl: string;
  amountIdr: number;
}

/**
 * Purchase success email template (Indonesian).
 */
export function tplPurchaseSuccess(opts: PurchaseSuccessOpts): EmailPayload {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  const amt = 'Rp ' + opts.amountIdr.toLocaleString('id-ID');

  return {
    to: '', // Caller sets this
    subject: `✅ Pembelian berhasil — ${opts.productName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:#6366f1;padding:24px 32px;border-radius:12px 12px 0 0">
          <div style="color:#fff;font-size:22px;font-weight:800">Migancore</div>
          <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px">Digital Products</div>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Pembelian Berhasil! 🎉</h1>
          <p style="color:#64748b;margin:0 0 24px">Halo <strong>${opts.buyerName}</strong>, terima kasih sudah membeli produk digital kami.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px">
            <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Detail Pesanan</div>
            <div style="font-size:15px;font-weight:700">${opts.productName}</div>
            <div style="font-size:13px;color:#64748b;margin-top:4px">Order: ${opts.orderId} · ${amt}</div>
          </div>
          <a href="${siteUrl}/app/downloads"
             style="display:block;text-align:center;background:#6366f1;color:#fff;text-decoration:none;padding:14px;border-radius:10px;font-weight:700;font-size:15px;margin-bottom:16px">
            ⬇ Buka My Downloads
          </a>
          <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0">Akses di dashboard · Login dengan akun yang digunakan saat membeli.</p>
        </div>
      </div>`,
  };
}

export interface PasswordResetOpts {
  recipientName: string;
  resetUrl: string;
  expiryMinutes?: number;
}

/**
 * Password reset email template.
 */
export function tplPasswordReset(opts: PasswordResetOpts): EmailPayload {
  const expiry = opts.expiryMinutes ?? 60;

  return {
    to: '', // Caller sets this
    subject: '🔑 Reset Your Password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:#6366f1;padding:24px 32px;border-radius:12px 12px 0 0">
          <div style="color:#fff;font-size:22px;font-weight:800">Migancore</div>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Password Reset</h1>
          <p style="color:#64748b;margin:0 0 24px">Hi ${opts.recipientName},</p>
          <p style="color:#64748b;margin:0 0 20px">Click the button below to reset your password. This link expires in ${expiry} minutes.</p>
          <a href="${opts.resetUrl}"
             style="display:block;text-align:center;background:#6366f1;color:#fff;text-decoration:none;padding:14px;border-radius:10px;font-weight:700;font-size:15px;margin-bottom:24px">
            🔑 Reset Password
          </a>
          <p style="font-size:12px;color:#94a3b8;margin:0">If you didn't request this, ignore this email.</p>
        </div>
      </div>`,
  };
}
