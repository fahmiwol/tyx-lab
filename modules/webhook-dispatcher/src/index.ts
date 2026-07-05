/**
 * Webhook integration dispatcher — fan-out POST to active integrations with timeout.
 *
 * Why: Gateways need to notify downstream systems (CRM, analytics, fulfillment).
 * This pattern batches sends, handles timeouts, logs failures for audit.
 *
 * Usage:
 *   await dispatcher.notifyHooks("order.created", { orderId: "123", total: 50000 });
 */

export interface IntegrationHook {
  id: string;
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  status: "active" | "inactive";
}

export interface WebhookLog {
  integrationId: string;
  request: { url: string; event: string; payload: any };
  response: { status?: number; body?: string };
  error?: string;
  timestamp: Date;
}

export class WebhookDispatcher {
  constructor(
    private integrations: IntegrationHook[],
    private timeoutMs: number = 15000,
  ) {}

  /**
   * Fan-out webhook POST to all active integrations (fire-and-forget).
   * Returns log entries for audit; failures are non-fatal.
   */
  async notifyHooks(event: string, payload: any): Promise<WebhookLog[]> {
    const logs: WebhookLog[] = [];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const results = await Promise.allSettled(
      this.integrations
        .filter((i) => i.status === "active")
        .map(async (integration) => {
          const url = `${integration.baseUrl.replace(/\/$/, "")}/hooks/${event}`;
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(integration.apiKey ? { Authorization: `Bearer ${integration.apiKey}` } : {}),
            ...(integration.headers ?? {}),
          };

          try {
            const res = await fetch(url, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
              signal: controller.signal,
            });

            const body = await res.text();
            logs.push({
              integrationId: integration.id,
              request: { url, event, payload },
              response: { status: res.status, body },
              timestamp: new Date(),
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logs.push({
              integrationId: integration.id,
              request: { url, event, payload },
              response: {},
              error: message,
              timestamp: new Date(),
            });
          }
        }),
    );

    clearTimeout(timeoutId);
    return logs;
  }

  /**
   * Filter active integrations.
   */
  activeIntegrations(): IntegrationHook[] {
    return this.integrations.filter((i) => i.status === "active");
  }
}
