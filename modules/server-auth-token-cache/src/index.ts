const BRAIN_URL = process.env.AUTH_ENDPOINT ?? "https://api.example.com";
const EMAIL = process.env.AUTH_EMAIL ?? "";
const PASSWORD = process.env.AUTH_PASSWORD ?? "";
const STATIC_TOKEN = process.env.AUTH_TOKEN ?? "";

let cached: { token: string; exp: number } | null = null;

function expOf(jwt: string): number {
  try {
    return JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString()).exp ?? 0;
  } catch {
    return 0;
  }
}

async function login(): Promise<string | null> {
  if (!EMAIL || !PASSWORD) return STATIC_TOKEN || null;

  try {
    const r = await fetch(`${BRAIN_URL}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    if (!r.ok) return STATIC_TOKEN || null;

    const tok = (await r.json()).access_token as string;
    cached = { token: tok, exp: expOf(tok) };
    return tok;
  } catch {
    return STATIC_TOKEN || null;
  }
}

/**
 * Get cached JWT token; auto-refresh if within 60s of expiry or forced.
 * On login failure, falls back to STATIC_TOKEN.
 */
export async function getAuthToken(force = false): Promise<string | null> {
  const now = Date.now() / 1000;

  // Check if cached token is still valid (with 60s buffer)
  if (!force && cached && cached.exp - 60 > now) {
    return cached.token;
  }

  return login();
}
