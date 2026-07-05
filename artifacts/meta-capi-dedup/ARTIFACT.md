# Meta Pixel + Conversions API with Dedup

**Kind:** playbook · **Category:** infra · **Status:** stable

Production-ready Meta ads tracking for any SSR app (Next.js shown): fire each event
from **both** the browser Pixel and the server Conversions API (CAPI) with the **same
`event_id`**, so Meta deduplicates them into one event carrying the best signals from
both. No CAPI Gateway (AWS/Birch) required.

---

## Why this exists

Browser-only Pixel tracking loses 20-40% of events to ad-blockers and iOS ITP.
Server-only CAPI loses browser-side signals. Firing both naively double-counts. The
fix is a shared `event_id`: Meta collapses the browser and server hits into a single
event within a 60s window, and **Event Match Quality (EMQ)** climbs to 7+/10 because
the two sources'' signals merge. No CAPI Gateway to pay for or operate.

## When to use / when not

- Use when: SSR stack, you have a Pixel ID + CAPI access token, you want to bypass
  ad-blockers/ITP and raise EMQ.
- Do not use when: pure SPA (no server render) -> use Tag Manager + Gateway; or
  >10k events/sec -> use a Gateway for backpressure.

## Architecture

```
Browser            Your SSR Server              Meta Graph API
  |  GET /page          |                            |
  | ------------------> |  POST /events (eid=X) ---> |  (server fire)
  | <------------------ |  HTML + fbq snippet        |
  |   eventID X embedded|                            |
  | fbq(track, ..., {eventID:X}) -----------------> |  (browser fire)
  |                     |   Meta dedupes by event_id |
```

## 1. CAPI client

```ts
import crypto from "node:crypto";

const META_GRAPH_VERSION = process.env.META_GRAPH_API_VERSION ?? "v21.0";
const FBP_SUBDOMAIN_IDX = "1";

export function generateFbp(now = Date.now()): string {
  const rand = crypto.randomInt(1_000_000_000, 9_999_999_999);
  return `fb.${FBP_SUBDOMAIN_IDX}.${now}.${rand}`;
}
export function buildFbcFromFbclid(fbclid: string, now = Date.now()): string {
  return `fb.${FBP_SUBDOMAIN_IDX}.${now}.${fbclid}`;
}
export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toLowerCase()).digest("hex");
}

export interface CapiUserData {
  emailHash?: string; phoneHash?: string; externalId?: string;
  ipAddress?: string; userAgent?: string; fbc?: string; fbp?: string;
}
export interface CapiEvent {
  eventName: string; eventId: string; eventTime?: number; sourceUrl: string;
  userData: CapiUserData; customData?: Record<string, unknown>;
}

export async function sendCapiEvents(input: {
  pixelId: string; accessToken: string; testEventCode?: string; events: CapiEvent[];
}) {
  const payload = {
    data: input.events.map((e) => ({
      event_name: e.eventName,
      event_time: e.eventTime ?? Math.floor(Date.now() / 1000),
      event_id: e.eventId,
      event_source_url: e.sourceUrl,
      action_source: "website",
      user_data: {
        em: e.userData.emailHash, ph: e.userData.phoneHash,
        external_id: e.userData.externalId,
        client_ip_address: e.userData.ipAddress,
        client_user_agent: e.userData.userAgent,
        fbc: e.userData.fbc, fbp: e.userData.fbp,
      },
      custom_data: e.customData ?? {},
    })),
    ...(input.testEventCode ? { test_event_code: input.testEventCode } : {}),
    access_token: input.accessToken,
  };
  const res = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${input.pixelId}/events`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
  );
  return { ok: res.ok, status: res.status, body: await res.text() };
}
```

## 2. Browser tracker

The client passes the server-rendered `event_id` to `fbq` as the 3rd arg `{eventID}` —
Meta uses it as the dedup key. Uses generic `data-track-*` attributes.

```ts
export function buildClickTrackerSnippet(): string {
  return `(function(){
    function fire(eventName, payload){
      try {
        var eventId = payload && payload.event_id;
        if (window.fbq) {
          if (eventId) window.fbq("track", eventName, payload, {eventID: eventId});
          else window.fbq("track", eventName, payload);
        }
      } catch(e){}
    }
    document.addEventListener("click", function(e){
      var el = e.target;
      while (el && el !== document.body) {
        if (el.dataset && el.dataset.trackEvent) {
          var payload = {};
          try { payload = JSON.parse(el.dataset.trackPayload || "{}"); } catch(_) {}
          fire(el.dataset.trackEvent, payload);
          return;
        }
        el = el.parentNode;
      }
    }, { capture: true, passive: true });
    window.capiTrack = fire;
  })();`;
}
```

## 3. Request to user_data helper

```ts
export function buildCapiUserData(input: {
  ip?: string|null; userAgent?: string|null;
  fbpCookie?: string|null; fbcCookie?: string|null;
  fbclidParam?: string|null; sessionId?: string|null;
}) {
  const now = Date.now();
  let fbp = input.fbpCookie ?? undefined; let fbpToSet;
  if (!fbp) { fbp = generateFbp(now); fbpToSet = fbp; }
  let fbc = input.fbcCookie ?? undefined; let fbcToSet;
  if (!fbc && input.fbclidParam) { fbc = buildFbcFromFbclid(input.fbclidParam, now); fbcToSet = fbc; }
  return {
    userData: {
      ipAddress: input.ip ?? undefined, userAgent: input.userAgent ?? undefined,
      fbp, fbc, externalId: input.sessionId ? sha256Hex(input.sessionId) : undefined,
    },
    fbpToSet, fbcToSet,
  };
}
// Persist server-generated _fbp / _fbc to response cookies (90-day, SameSite=Lax,
// Secure, httpOnly:false) so the browser SDK reuses the same values.
```

## 4. Server-side fire (page shell)

```tsx
const pageViewEid = crypto.randomUUID();
const viewContentEid = crypto.randomUUID();
const h = await headers(); const c = await cookies();
const { userData } = buildCapiUserData({
  ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
  userAgent: h.get("user-agent"),
  fbpCookie: c.get("_fbp")?.value, fbcCookie: c.get("_fbc")?.value,
  sessionId: c.get("your_session_cookie")?.value,
});
void sendCapiEvents({
  pixelId, accessToken,
  testEventCode: process.env.META_TEST_EVENT_CODE || undefined,
  events: [
    { eventName: "PageView", eventId: pageViewEid, sourceUrl, userData },
    { eventName: "ViewContent", eventId: viewContentEid, sourceUrl, userData },
  ],
}).catch(() => {});
// Inline script fires browser fbq with the SAME event_id => Meta dedupes.
```

## Verification

1. Set `META_TEST_EVENT_CODE=TESTxxxxx`, open Events Manager -> Test Events, trigger
   the flow. Expect PageView + ViewContent with a "Deduplicated" badge (Browser +
   Server both ticked).
2. Smoke test the raw endpoint with a curl POST of one PageView event to
   `graph.facebook.com/v21.0/PIXEL_ID/events` — expect `{"events_received":1}`.
3. **Remove `META_TEST_EVENT_CODE` after verifying**, or production traffic stays
   stuck in Test mode.

## Gotchas

| Gotcha | Fix |
|--------|-----|
| Price divided by 100 | Integer-currency amounts are not cents. Send as-is. |
| Events double-counted | Browser `fbq` 3rd arg MUST be `{eventID: same_uuid}`. |
| EMQ stuck at 4-5/10 | Add `external_id` (hashed session), `_fbp`, `_fbc`, IP, user agent. |
| Server `_fbp` differs from SDK | Write the server-generated `_fbp` to a response cookie. |
| Milestone will not tick | `test_event_code` set -> events trapped in Test tab. Remove env var. |

---

*Open source — use it wisely. Send only hashed PII, and honor consent/opt-out before firing.*