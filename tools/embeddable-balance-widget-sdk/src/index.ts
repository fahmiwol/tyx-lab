export type DisplayMode = "compact" | "full" | "card";
export type Currency = "GOLD" | "SILVER" | "BRONZE" | "DIAMOND" | "ALL";

export interface WidgetConfig {
  walletAddress: string;
  displayMode: DisplayMode;
  currency: Currency;
  refreshInterval: number;
  theme?: "light" | "dark";
  locale?: string;
}

export interface WidgetInstance {
  widgetVersion: string;
  iframeUrl: string;
  jsBundle: string;
  cssBundle: string;
  config: WidgetConfig;
}

export async function initializeWidget(config: WidgetConfig): Promise<WidgetInstance> {
  const widgetVersion = "1.0.0";
  const iframeUrl = `https://widgets.example.com/balance?addr=${encodeURIComponent(config.walletAddress)}&mode=${config.displayMode}`;
  
  return {
    widgetVersion,
    iframeUrl,
    jsBundle: `https://cdn.example.com/widget-${widgetVersion}.js`,
    cssBundle: `https://cdn.example.com/widget-${widgetVersion}.css`,
    config,
  };
}

export function mountWidget(elementId: string, config: WidgetConfig): void {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element ${elementId} not found`);
  const iframe = document.createElement("iframe");
  iframe.src = `https://widgets.example.com/balance?addr=${encodeURIComponent(config.walletAddress)}`;
  iframe.style.border = "none";
  iframe.style.width = "100%";
  iframe.style.height = "auto";
  el.appendChild(iframe);
}
