# TTS Voice Module

Multi-engine Text-to-Speech with voice cloning support.

## Features

- **Multi-Engine** — OpenAI TTS, Coqui XTTS-v2 (self-hosted), Web Speech API
- **Voice Cloning** — Upload reference WAV with Coqui engine
- **React Component** — Drop-in TTSModule component
- **Custom Hooks** — useTTS hook for custom integration
- **Language Support** — Indonesian, English, multilingual via Coqui
- **Security** — API keys server-side only, input sanitization

## Installation

### 1. Dependencies

```bash
npm install lucide-react
```

### 2. Copy Files to Next.js Project

```
components/TTSModule.tsx   → src/components/tts/TTSModule.tsx
hooks/useTTS.ts            → src/hooks/useTTS.ts
api/tts/openai/route.ts    → src/app/api/tts/openai/route.ts
api/tts/coqui/route.ts     → src/app/api/tts/coqui/route.ts
```

### 3. Environment (.env.local)

```env
# OpenAI TTS
OPENAI_API_KEY=sk-...

# Coqui XTTS-v2 (self-hosted)
COQUI_SERVER_URL=http://localhost:5002
COQUI_API_KEY=

# CORS
ALLOWED_ORIGIN=https://yourdomain.com
```

## Usage — Component

```tsx
import TTSModule from "@/components/tts/TTSModule";

export default function Page() {
  return (
    <TTSModule
      onGenerated={(audioUrl, text, engine) => {
        console.log("Audio ready:", audioUrl, "via", engine);
      }}
    />
  );
}
```

## Usage — Hook

```tsx
import { useTTS } from "@/hooks/useTTS";

function MyComponent() {
  const { synthesize, play, pause, stop, download, isLoading, audioUrl, error } = useTTS({
    engine: "openai",
    voice: "nova",
    speed: 1.1,
  });

  return (
    <div>
      <button onClick={() => synthesize("Hello world!")}>Generate</button>
      {audioUrl && <button onClick={play}>Play</button>}
      {isLoading && <span>Loading...</span>}
      {error && <span>Error: {error}</span>}
    </div>
  );
}
```

## Engines

| Engine        | Clone | Indonesian | API Key | Cost  |
|---------------|-------|------------|---------|-------|
| OpenAI TTS    | ❌    | Partial    | Yes     | Paid  |
| Coqui XTTS-v2 | ✅    | ✅         | Optional| Free* |
| Web Speech    | ❌    | ✅ (OS)    | No      | Free  |

*Coqui requires self-hosted server (GPU recommended).

## Running Coqui XTTS-v2

```bash
pip install TTS
tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2 --port 5002
```

Or Docker:
```bash
docker run --rm -it -p 5002:5002 ghcr.io/coqui-ai/tts-cpu
```

## Security

- API keys never sent to client — always server-side via env
- Text input sanitized & limited (4096 OpenAI, 2000 Coqui)
- Voice selection whitelisted on server
- CORS configurable via ALLOWED_ORIGIN

Open source — use it wisely.