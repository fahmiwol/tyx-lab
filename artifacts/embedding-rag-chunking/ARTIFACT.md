# Embedding & RAG Chunking Helpers — Semantic Fragment Strategy

## Purpose
Split long documents into semantically coherent chunks for embedding & RAG retrieval, with metadata tagging and hierarchical overlap to preserve context.

## Problem
- **Naive chunking fails**: Fixed-size token chunks split sentences mid-thought; retrieval returns incoherent fragments
- **Context loss**: Chunks too small → missing context; chunks too large → mixing unrelated topics
- **Hierarchical blindness**: Flat list of chunks loses section hierarchy (intro → para 1 → para 2 vs. topic A → topic B)
- **Metadata gaps**: No way to filter retrieval by source tier, author, date, or custom tagging
- **Overlap complexity**: Overlapping chunks improve retrieval but need careful bookkeeping to avoid duplication

## Solution
Smart chunker with multiple strategies (semantic boundary, token, sentence) and configurable overlap. Respects document structure (headings, lists) and auto-extracts metadata (source, section, date). Each chunk tagged with confidence score and context summary.

## Key Patterns
1. **Semantic boundaries** — Split at section headers, paragraph breaks, or list boundaries (not mid-sentence)
2. **Token-aware fallback** — If semantic chunk too large, split by token window but try to preserve sentence boundaries
3. **Hierarchical tagging** — Each chunk knows its section path (Document > Section 1 > Subsection A)
4. **Metadata extraction** — Auto-parse heading hierarchy, extract date/author from frontmatter, apply custom taxonomy
5. **Overlap window** — Each chunk includes tail of prior chunk (e.g., 50 tokens) to maintain conversation continuity
6. **Confidence scoring** — Mark chunk quality (is it a complete thought? or fragment?) → weight retrieval results

## Output
- Chunker factory: `createChunker(strategy, config) → { chunk(document) → Chunk[] }`
- Chunk schema: `{ id, text, metadata: { source, section_path, tags, date, confidence }, embedding?, char_offset }`
- Metadata extractor: `extractMetadata(document) → { title, author, date, sections }`
- Overlap manager: tracks which chunks are variants of same source segment

## Used in
- Sidix corpus indexing (split research docs; tag by tier)
- RAG pipelines (chunk → embed → index → retrieve)
- Prompt context building (select top-K chunks + overlap for coherence)

---

*Open source — use it wisely.*
