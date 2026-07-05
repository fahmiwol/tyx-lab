# Eval Benchmark Harness

Benchmark model before/after training.

## Metrics
1. **Perplexity**: Lower = better (holdout test set)
2. **Epistemic Accuracy**: % correct [FAKTA]/[OPINI]/[SPEKULASI]/[UNKNOWN] labels
3. **Response Relevance**: BLEU/ROUGE-like vs reference answers
4. **Sanad Coverage**: % answers with sources/citations
5. **Conversational Quality**: CQF-lite heuristic scorer

## Reference Benchmark
- Seed dataset: 5 curated + synthetic examples
- Covers: factual, opinion, speculation, unknown, math
- JSONL format (extensible)

## Usage
```python
from eval_benchmark_harness import run_benchmark
scores = run_benchmark(model_path='./sidix-distilled-adapter')
print(f'Perplexity: {scores["perplexity"]}')
print(f'Epistemic Accuracy: {scores["epistemic_accuracy"]}')
```

Open source — use it wisely.
