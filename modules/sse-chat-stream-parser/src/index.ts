export type ToolEvent = { phase: "start" | "result"; names?: string[]; name?: string; ok?: boolean };
export type ChatChunk = { delta: string; done: boolean; tool?: ToolEvent };

/** Parse one SSE data: payload into ChatChunk. Tolerant of variants and plain text. */
function parseFrame(payload: string): ChatChunk | null {
  const s = payload.trim();
  if (!s || s === "[DONE]") return null;
  
  let o: Record<string, unknown>;
  try {
    o = JSON.parse(s);
  } catch {
    return { delta: s, done: false }; // plain-text fallback
  }

  if (o.type === "tool_start") {
    const names = Array.isArray(o.tools)
      ? (o.tools as Array<{ name?: string }>).map((t) => t?.name).filter((n): n is string => !!n)
      : [];
    return { delta: "", done: false, tool: { phase: "start", names } };
  }

  if (o.type === "tool_result") {
    return { delta: "", done: false, tool: { phase: "result", name: String(o.tool ?? ""), ok: o.ok !== false } };
  }

  if (o.type === "ping") return null;
  if (o.type === "error") return { delta: `\n\n_[${(o.message as string) ?? "error"}]_`, done: false };

  // Try multiple field names for content
  const d = (o.token ?? o.delta ?? o.content ?? o.text ?? o.response ?? "") as string;
  return d ? { delta: d, done: false } : null;
}

/** Stream chat from SSE endpoint. Yields one chunk per frame. */
export async function* streamSSE(endpoint: string, body: object): AsyncGenerator<ChatChunk> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    yield { delta: `[Network error: ${String(e)}]`, done: true };
    return;
  }

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    yield { delta: `[Error: ${res.status}. ${detail.slice(0, 160)}]`, done: true };
    return;
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;

    buf += dec.decode(value, { stream: true });
    const frames = buf.split("\n\n");
    buf = frames.pop() ?? "";

    for (const frame of frames) {
      for (const line of frame.split("\n")) {
        if (line.startsWith("data:")) {
          const c = parseFrame(line.slice(5));
          if (c) yield c;
        }
      }
    }
  }

  yield { delta: "", done: true };
}
