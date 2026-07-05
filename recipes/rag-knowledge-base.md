# Recipe: Grounded RAG Knowledge Base

## Description
Turn a document corpus into a grounded, traceable retrieval layer for an LLM — with semantic
chunking, layered memory, and provenance so every answer can cite its source.

## Atoms Used
1. `modules/embedding-rag-chunking` — semantic, hierarchical document splitting
2. `modules/agent-memory-3layer-retrieval` — FTS + timeline + full progressive retrieval
3. `modules/knowledge-sanad-validator` — provenance / chain-of-custody on every chunk
4. `modules/llm-provider-fallback` — resilient generation over retrieved context

## Execution Order
docs -> embedding-rag-chunking -> index; query -> agent-memory-3layer-retrieval -> knowledge-sanad-validator -> llm-provider-fallback (answer with citations)

## Final Output
A RAG stack where retrieval is efficient, layered, and every retrieved fact carries a verifiable source.

*Open source — use it wisely.*