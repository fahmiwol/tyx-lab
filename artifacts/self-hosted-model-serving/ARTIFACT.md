# Self-Hosted Model Serving Architecture: Local-First SLM Deployment

**Version:** 1.0.0 | **Category:** Infra | **Status:** stable

## Overview

A production-grade architecture for deploying small language models (7B-13B) on commodity hardware without relying on proprietary cloud APIs. Covers inference serving, model versioning, hot-swap deployment, and cost management.

## Architecture Layers

```
API Gateway (Nginx/Caddy) - SSL termination, rate limiting
    ↓
Inference Manager (ollama/vLLM) - Handles requests, quantization
    ↓
Model Registry (versioned GGUF files) - model v0.4, v0.5, v0.6
    ↓
Memory (Redis/Memcached) - KV cache, conversation state
    ↓
Vector DB (Qdrant/Milvus) - Semantic search for context
    ↓
Hardware (GPU or CPU optimized) - RTX 4090 or CPU servers
```

## Layer 1: Inference Server (Ollama or vLLM)

### Option A: Ollama (Simplicity)
Install: curl https://ollama.ai/install.sh | sh
Start: ollama serve
API: http://localhost:11434/api/generate

### Option B: vLLM (Performance)
Higher throughput, batching, optimized inference
API Server: python -m vllm.entrypoints.openai.api_server --model mistral-7b

## Layer 2: Model Registry & Versioning

File structure:
```
/models
├── migancore-base-0.4.gguf (4.4GB)
├── migancore-0.5.gguf (4.4GB with DPO)
├── migancore-0.6.gguf (4.4GB with LoRA)
└── metadata.json
```

Metadata schema:
```json
{
  "versions": {
    "0.6": {
      "filename": "migancore-0.6.gguf",
      "size_bytes": 4600000000,
      "sha256": "abc123...",
      "quantization": "Q4_K_M",
      "created_at": "2026-05-12T16:00:00Z",
      "eval_score": 0.72,
      "status": "active"
    }
  },
  "active_model": "0.6"
}
```

## Layer 3: Hot-Swap Deployment (Zero Downtime)

Blue-Green pattern:
1. Start new Ollama on :11435 (while :11434 serves)
2. Health check new model
3. Switch Nginx upstream to :11435
4. Drain old instance
5. Shut down old process

Nginx upstream config:
```nginx
upstream ollama_backend {
    server 127.0.0.1:11434;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://ollama_backend;
        proxy_buffering off;
    }
}
```

## Layer 4: Conversation State (Redis)

Store active conversation state for stateless inference:
```
Key: conv:{id}
Fields: user_id, messages (JSON), model_version, created_at
TTL: 24 hours
```

## Layer 5: Vector DB for Context Retrieval

Use Qdrant or Milvus for semantic search:
- Store embeddings of user messages
- Retrieve similar past conversations
- Support RAG (Retrieval Augmented Generation)

## Deployment Checklist

- Ollama or vLLM installed and tested
- Model quantized to GGUF (Q4_K_M)
- Model registry versioned with metadata.json
- Hot-swap script tested (blue-green deployment)
- Redis running for conversation state
- Qdrant running for vector retrieval
- Nginx configured with upstream pools
- Health check endpoint: GET /health returns 200
- Rate limiting configured (100 req/min per IP)
- SSL/TLS with Caddy or Let's Encrypt
- Monitoring: throughput, latency, error rates
- Daily backup of model files

## Cost Analysis (vs Cloud APIs)

| Model | Hardware | Monthly Cost | Cost per 1M tokens |
|-------|----------|--------------|-------------------|
| 7B local (RTX 4090) | $1,800 one-time | $50/mo | ~$0.001 |
| 7B local (CPU server) | $500/mo rental | $500/mo | ~$0.002 |
| Cloud API (Gemini) | None | Pay-as-you-go | $0.075 |
| Cloud API (GPT-4o) | None | Pay-as-you-go | $2.50 |

**Breakeven:** 1-2 years for self-hosted, then free. Suitable for >10M tokens/month.

*Open source — use it wisely.*
