# SLM vs Cloud API: Decision Framework for Model Selection

**Version:** 1.0.0 | **Category:** Business | **Status:** stable

## Overview

A decision framework for choosing between self-hosted small language models (7B-13B) and cloud APIs (Gemini, GPT-4, Claude) based on latency, cost, privacy, customization, and reliability requirements.

## Decision Matrix

| Factor | SLM (7B local) | Cloud API | Winner |
|--------|---|---|---|
| Cost @ 10M tokens/mo | $50-100 | $750K+ | SLM |
| Cost @ 100M tokens/mo | $100-200 | $7.5M+ | SLM |
| Latency (p95) | 200-500ms | 1-5s | SLM |
| Customization | Full | Limited | SLM |
| Privacy (data stays local) | Yes | No | SLM |
| Quality (general reasoning) | Medium | High | API |
| Quality (specialized domain) | High (with training) | Medium | SLM |
| Reliability (no outages) | Under your control | Dependent on provider | SLM |
| Setup effort | 40 hours | 2 hours | API |
| Hardware cost (one-time) | $1,500 - $3,000 | $0 | API |
| Compliance (HIPAA, SOC2) | Your responsibility | Provider handles | API |

## Cost Breakeven Analysis

```
Cloud API cost / month = (tokens / 1M) * price_per_1M

Gemini Flash @ 10M tokens/mo:
  $0.075/1M * 10 = $750/month

SLM (self-hosted):
  GPU rental: $500/month
  Electricity: $50/month
  Total: $550/month

Breakeven: 7.3M tokens/month
=> Above 7.3M, SLM is cheaper
```

## Decision Tree

```
START
  |
  ├─ Need specialized domain knowledge?
  |  └─ Yes → Use SLM (fine-tune/LoRA training)
  |  └─ No → Continue
  |
  ├─ Privacy critical (HIPAA, financial data)?
  |  └─ Yes → Use SLM (self-hosted)
  |  └─ No → Continue
  |
  ├─ Expected monthly tokens > 10M?
  |  └─ Yes → Use SLM (cost-effective at scale)
  |  └─ No → Continue
  |
  ├─ Latency requirement < 200ms (p95)?
  |  └─ Yes → Use SLM (local inference)
  |  └─ No → Continue
  |
  ├─ Need world-class reasoning on novel tasks?
  |  └─ Yes → Use Cloud API (GPT-4o, Claude Opus)
  |  └─ No → Use SLM
  |
  ├─ Can tolerate provider outages?
  |  └─ No → Use SLM (control availability)
  |  └─ Yes → Continue
  |
  ├─ Setup time / engineering budget < 40 hours?
  |  └─ Yes → Use Cloud API (faster launch)
  |  └─ No → Continue
  |
  └─ DECISION: Use SLM (default)
```

## Use Case Scenarios

### Scenario A: Customer Support Chatbot
- Volume: 5M tokens/month
- Latency requirement: 500ms OK
- Privacy: Medium (customer names, issues)
- Customization: High (brand voice, knowledge base)
- **Recommendation: SLM**
- Cost: $150/month self-hosted vs $375 API
- Setup: 20 hours (LoRA fine-tuning on support patterns)

### Scenario B: Real-Time Code Completion
- Volume: 50M tokens/month
- Latency: <100ms required (p99)
- Privacy: High (source code)
- Customization: Moderate (code style learning)
- **Recommendation: SLM (hybrid with API fallback)**
- Cost: $300/month self-hosted + $50/month API fallback
- Setup: 40 hours (optimize inference, caching)

### Scenario C: Once-Daily Report Generation
- Volume: 500K tokens/month
- Latency: Minutes OK
- Privacy: Medium
- Customization: Low (template-based)
- **Recommendation: Cloud API**
- Cost: $37/month (Gemini)
- Setup: 2 hours (API integration)

### Scenario D: Medical Diagnosis Support
- Volume: 1M tokens/month
- Latency: 5s OK
- Privacy: CRITICAL (HIPAA compliance)
- Customization: High (medical knowledge, protocols)
- **Recommendation: SLM (on-premise, air-gapped)**
- Cost: $200/month (dedicated hardware)
- Setup: 80 hours (security audit, model vetting)

### Scenario E: Multi-Language Translation
- Volume: 100M tokens/month
- Latency: 1s OK
- Privacy: Low
- Customization: Moderate (domain terminology)
- **Recommendation: SLM with API fallback**
- Cost: $500/month self-hosted + $100/month API fallback
- Setup: 30 hours (LoRA for terminology, load balancing)

## Hybrid Strategy (Best of Both)

Use SLM as **primary** with Cloud API as **fallback**:

```python
def get_completion(prompt: str, model: str = "auto"):
    if model == "auto":
        # Use local SLM
        try:
            response = ollama.generate(prompt, model="migancore:0.5")
            return response
        except (TimeoutError, ConnectionError):
            # Fall back to cloud
            response = anthropic.messages.create(
                model="claude-opus",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
    elif model == "slm_only":
        return ollama.generate(prompt)
    elif model == "api_only":
        return anthropic.messages.create(...)
```

## Performance Comparison Matrix

| Task | SLM (7B) | Gemini Flash | GPT-4o | Claude |
|------|----------|---|---|---|
| Customer Q&A | 85% quality, 300ms | 90%, 2s | 95%, 3s | 94%, 2.5s |
| Code generation | 78%, 400ms | 80%, 2.5s | 92%, 3s | 90%, 2.8s |
| Reasoning (complex) | 65%, 500ms | 75%, 2s | 90%, 2.5s | 88%, 2.3s |
| Domain-specific (medical) | 92% (fine-tuned), 350ms | 70%, 2s | 75%, 2.5s | 73%, 2.3s |
| Cost @ 1M tokens | $0.005 | $0.075 | $2.50 | $3.00 |

## Implementation Checklist

### For SLM Choice:
- [ ] Quantize model to GGUF (Q4_K_M)
- [ ] Benchmark latency on target hardware
- [ ] Set up hot-swap deployment
- [ ] Monitor quality via eval gate
- [ ] Build fallback to API
- [ ] Document model versioning

### For Cloud API Choice:
- [ ] Compare pricing across providers
- [ ] Test latency for your use case
- [ ] Verify compliance (SOC2, GDPR, HIPAA)
- [ ] Set up rate limiting / billing alerts
- [ ] Plan SLM fallback strategy

*Open source — use it wisely.*
