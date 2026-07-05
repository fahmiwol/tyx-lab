/**
 * Multi-provider AI router with fallback strategy.
 * Priority: Groq (free: 14400 req/day) → Gemini (free: 1M tokens/day) → Ollama (local) → Anthropic
 *
 * Each provider is wrapped; errors trigger fallback.
 * Usage:
 *   const result = await aiRouter(prompt, { maxTokens: 600, systemPrompt: '...' });
 *   console.log(result.text, result.provider); // "hello world", "groq"
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

export interface AIRouterOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIRouterResult {
  text: string;
  provider: string;
  model: string;
}

// ─── GROQ (free: 14400 req/day, llama-3.1-8b-instant) ───────────────────────
async function callGroq(prompt: string, opts: AIRouterOptions): Promise<string | null> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const messages: any[] = [];
    if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages,
        max_tokens: opts.maxTokens || 600,
        temperature: opts.temperature ?? 0.7,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    return data.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// ─── GEMINI (free: 1M token/day, gemini-1.5-flash) ─────────────────────────
async function callGemini(prompt: string, opts: AIRouterOptions): Promise<string | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const fullPrompt = opts.systemPrompt ? `${opts.systemPrompt}\n\n${prompt}` : prompt;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      contents: fullPrompt,
      config: {
        maxOutputTokens: opts.maxTokens || 600,
        temperature: opts.temperature ?? 0.7,
      },
    });

    return response.text?.trim() || null;
  } catch {
    return null;
  }
}

// ─── OLLAMA (local, unlimited) ──────────────────────────────────────────────
async function callOllama(prompt: string, opts: AIRouterOptions): Promise<string | null> {
  try {
    const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "llama3.1";

    const messages: any[] = [];
    if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
    messages.push({ role: "user", content: prompt });

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    return data.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// ─── ANTHROPIC (paid, fallback) ──────────────────────────────────────────────
async function callAnthropic(prompt: string, opts: AIRouterOptions): Promise<string | null> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const client = new Anthropic({ apiKey });

    const systemPrompt = opts.systemPrompt || "You are a helpful assistant.";
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      max_tokens: opts.maxTokens || 600,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
      temperature: opts.temperature ?? 0.7,
    });

    return response.content[0]?.type === "text" ? response.content[0].text.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Route to first available provider in priority order.
 * Throws if all providers fail or no API keys configured.
 */
export async function aiRouter(
  prompt: string,
  opts: AIRouterOptions = {}
): Promise<AIRouterResult> {
  const attempts = [
    { name: "groq", fn: callGroq },
    { name: "gemini", fn: callGemini },
    { name: "ollama", fn: callOllama },
    { name: "anthropic", fn: callAnthropic },
  ];

  for (const { name, fn } of attempts) {
    const result = await fn(prompt, opts);
    if (result) {
      return {
        text: result,
        provider: name,
        model: process.env[`${name.toUpperCase()}_MODEL`] || `default-${name}`,
      };
    }
  }

  throw new Error("All AI providers failed or not configured");
}
