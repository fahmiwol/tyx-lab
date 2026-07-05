# Self-Refining Agent Loop

## Overview
Implements the **Tafakkur** (تفكر — reflective self-improvement) pattern. The loop prevents single-pass mediocrity by running output through multiple critique lenses, then refining iteratively.

## Pattern

```
User Request
    ↓
[Innovator Agent] → Initial Output
    ↓
[Critic: Quality Check] → Issues + Score
    ↓
Decision: Score ≥ 0.8? → YES → Return (satisfactory)
    ↓ NO
[Refiner] → Improved Output (next iteration)
    ↓
Max Iterations? → Return
```

## Modes

- **quality_check**: Assess clarity, accuracy, completeness, factual claims
- **devil_advocate**: Find logical flaws, unsupported assumptions, counter-arguments
- **destruction_test**: Assume hostile audience; find every weakness

## Usage

```python
from self_refine import SelfRefineLoop

loop = SelfRefineLoop(llm_client=your_llm_client)
result = loop.refine(
    request="Write a headline for a tech product",
    initial_output="Revolutionary Technology Changes Everything",
    max_iterations=3
)

print(f"Final: {result['final_output']}")
print(f"Quality: {result['score']}")
```

## Why

1. Quality compounds with iteration
2. Prevents hallucination entrenchment
3. Multi-perspective catches missed errors
4. Early exit if ≥ 0.8 (most settle by iter 1-2)

## Epistemic Foundation
Quranic principle: "Afala tatafakkaruun?" — reflect and turn observation back on itself.

*Open source — use it wisely.*
