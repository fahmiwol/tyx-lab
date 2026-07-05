# Embedding Model Loader (3-Way)

Smart lazy-load embedding models per environment.

## Model Registry
| Model | Size | Multilingual | Latency | Use Case |
|-------|------|--------------|---------|----------|
| BGE-M3 | 0.5B | ✓ 100+ langs | ~12ms | DEFAULT |
| Mamba2-1.3B | 1.3B | ✓ | constant | Compromise |
| Mamba2-7B | 7B | ✓ | constant | Best quality |
| MiniLM | 0.1B | ⚠️ weak | ~3ms | CPU fallback |

## Selection Logic
1. ENV var `SIDIX_EMBED_MODEL` → explicit pick
2. Auto: try BGE-M3, fallback to MiniLM
3. Graceful: return None if all fail

## Usage
```python
from embedding_model_loader import load_embedding_model
embed_fn = load_embedding_model(model_name='bge-m3')
embeddings = embed_fn(['query1', 'query2'])
```

Open source — use it wisely.
