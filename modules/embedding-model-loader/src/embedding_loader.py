from __future__ import annotations
import logging
import os
from typing import Any, Optional, Callable

log = logging.getLogger(__name__)

MODELS = {
    "bge-m3": {
        "hf_id": "BAAI/bge-m3",
        "dim": 1024,
        "size_b": 0.5,
        "multilingual": True,
        "default": True,
    },
    "minilm": {
        "hf_id": "sentence-transformers/all-MiniLM-L6-v2",
        "dim": 384,
        "size_b": 0.1,
        "multilingual": False,
        "default": False,
    },
}

_model_cache = {}

def load_embedding_model(model_name: Optional[str] = None) -> Optional[Callable]:
    if model_name is None:
        model_name = os.getenv("SIDIX_EMBED_MODEL", "bge-m3")
    
    if model_name in _model_cache:
        return _model_cache[model_name]
    
    if model_name not in MODELS:
        log.warning(f"Model {model_name} not found, returning None")
        return None
    
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer(MODELS[model_name]["hf_id"])
        
        def embed_fn(texts):
            return model.encode(texts)
        
        _model_cache[model_name] = embed_fn
        return embed_fn
    except Exception as e:
        log.warning(f"Failed to load {model_name}: {e}")
        return None

def get_model_info(model_name: str = "bge-m3") -> Optional[dict]:
    return MODELS.get(model_name)

__all__ = ["load_embedding_model", "get_model_info", "MODELS"]
