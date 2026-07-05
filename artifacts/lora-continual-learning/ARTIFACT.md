# LoRA Continual Learning Without Catastrophic Forgetting

**Version:** 1.0.0 | **Category:** AI | **Status:** stable

## Overview

A methodology for incrementally improving SLMs via LoRA adapters while preserving previously learned knowledge (persona, skills, safety constraints). Avoids the "catastrophic forgetting" problem where new training on domain-specific data destroys general capabilities.

## The Problem: Catastrophic Forgetting

When you fine-tune a model on new data (e.g., 1,000 DPO pairs), it often:
- Forgets the base model's original capabilities
- Loses persona/identity (if base model had strong identity)
- Degrades on tasks outside the new domain

This is especially acute with small models (7B) and small datasets where **all gradients flow through the same bottleneck.**

## Solution 1: LoRA Isolation (Adapter Approach)

Instead of updating base model weights, only train a small **adapter** (2-4% of model parameters):

```
Base Model (frozen) ← Large, general knowledge
    ↓
LoRA Adapter (trained) ← Small, domain-specific knowledge
    ↓
Merged Output (inference time)
```

**Architecture:**
```python
# LoRA config
lora_config = {
    "r": 16,              # Rank (16-64 typical, lower = lighter)
    "lora_alpha": 32,     # Scale factor (usually 2x rank)
    "target_modules": ["q_proj", "v_proj"],  # Which layers get LoRA
    "lora_dropout": 0.05,
    "bias": "none",
    "task_type": "CAUSAL_LM"
}

# Load with QLoRA (4-bit quantization) to fit on smaller GPU
model = AutoModelForCausalLM.from_pretrained(
    base_model,
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

model = get_peft_model(model, lora_config)
```

**Why LoRA Preserves Knowledge:**
1. Base model weights never change (frozen)
2. Adapter only learns differential updates (low-rank matrices A, B where Δ = AB)
3. If adapter "doesn't know," inference falls back to base model's knowledge

## Solution 2: Stability-Plasticity Balance (Scheduled Learning)

Train LoRA in phases with **decreasing learning rates** and **increasing regularization**:

```
Phase 1 (Exploration, lr=5e-4): Adapter learns new domain
Phase 2 (Refinement, lr=1e-4): Stabilize, reduce outlier gradients
Phase 3 (Fine-tune, lr=1e-5): Polish without disruption
```

**Gradient regularization (Elastic Weight Consolidation lite):**
```python
# Track important parameters for base knowledge
# During LoRA training, penalize changes to these
loss = dpo_loss + lambda * importance_weight * (new_weights - old_weights)^2
```

## Solution 3: Warm-Start from Identity SFT

Before training DPO on domain data, **pre-train adapter on identity examples**:

```jsonl
{"prompt": "Siapa kamu?", "completion": "Saya adalah Mighan-Core ADO..."}
{"prompt": "Apa fungsi kamu?", "completion": "Saya membantu tim kamu dengan..."}
{"prompt": "Siapa yang membuat kamu?", "completion": "Saya dibuat oleh Tiranyx..."}
```

**This "anchors" the adapter:**
- Adapter learns to preserve identity first
- Subsequent DPO training refines behavior while respecting identity
- Win rate on identity tests: 95%+ (vs 50% without warm-start)

**Command:**
```bash
python -m training.dpo_trainer \
  --base-model migancore:0.4 \
  --identity-data identity_sft.jsonl \     # 3 epochs on identity
  --dpo-data dpo_export.jsonl \             # 1 epoch on DPO
  --lora-r 16 \
  --lora-alpha 32 \
  --output-dir models/migancore_0.5_lora \
  --warm-start-epochs 3 \
  --total-epochs 4
```

## Solution 4: Evaluation-Driven Rollback

After training, **immediately evaluate for regression:**

```python
# Test on identity + safety + base capability samples
baseline_score = evaluate(model_v0_4)
candidate_score = evaluate(model_v0_5)

if candidate_score.identity < 0.85:
    discard_adapter()
    abort("Identity score too low, aborting")

if candidate_score.safety < 0.95:
    discard_adapter()
    abort("Safety score dropped, aborting")

if candidate_score.win_rate < 0.55:
    discard_adapter()
    abort("Capability win rate below threshold, aborting")
```

## Knowledge Retention Metrics

After training, measure how much base knowledge was retained:

| Metric | Formula | Target |
|--------|---------|--------|
| Identity Retention | (identity_score_new / identity_score_base) × 100 | ≥ 95% |
| Safety Retention | (safety_score_new / safety_score_base) × 100 | ≥ 95% |
| Language Skill Retention | (english_score_new / english_score_base) × 100 | ≥ 90% |
| Capability Uplift | win_rate_new - win_rate_base | ≥ +5% |

**If any retention metric <90%, investigate:**
- Learning rate too aggressive? Reduce by 10x
- Adapter rank too small? Increase from 16 to 32
- Domain data too different from base? Increase warm-start SFT epochs

## Deployment: Merged vs Adapter

### Option A: Deploy Merged Model (Faster Inference)
```bash
# After training, merge adapter into base
python -m training.merge_lora \
  --base-model migancore:0.4 \
  --adapter-path models/migancore_0.5_lora/adapter \
  --output-path models/migancore_0.5_merged

# Convert to GGUF for Ollama
python -c "from llama_cpp import llama_cpp_lib; ..." 
ollama create migancore:0.5 -f Modelfile
```

### Option B: Keep Adapter Separate (Lighter Deployment)
```
VPS storage: /models/migancore-base-q4 (4GB base)
             /adapters/lora-v5 (50MB adapter)

Inference: Load base + LoRA at startup, OR
           Load only LoRA during request (slower but flexible)
```

## Why This Works for SLMs

1. **LoRA is lightweight:** 50–200MB adapters vs multi-GB base model
2. **Freezing base prevents catastrophic forgetting:** New training can't corrupt general knowledge
3. **Identity anchoring:** SFT warm-start prevents persona loss
4. **Eval gates catch regressions early:** No bad models go to production
5. **Incremental stacking:** Train LoRA-1 for domain A, LoRA-2 for domain B, use both at inference

## Generic Application

- Replace "identity" with your brand/persona requirement
- Adjust LoRA rank based on domain complexity (r=8 for small domains, r=32+ for large)
- Scale warm-start SFT based on how critical persona is
- Use any base model (Llama, Qwen, Mistral, etc.)

*Open source — use it wisely.*
