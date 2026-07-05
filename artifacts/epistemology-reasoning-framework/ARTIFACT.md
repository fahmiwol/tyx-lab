# Epistemology Framework — Structured Reasoning with Uncertainty & Citation

## Purpose
Embed uncertainty, source tracking, and chain-of-reasoning into agent outputs — making LLM decisions auditable and confidence-weighted for downstream systems.

## Problem
- **Opaque reasoning**: LLM returns answer without showing work; no visibility into confidence or dependency on bad source
- **Hallucinations invisible**: Wrong facts accepted as fact because no source label or uncertainty metric
- **Cascading errors**: Bad LLM output used as input to next agent; error propagates unseen
- **Audit liability**: Can't trace decision back to evidence; especially critical in research, medical, financial contexts
- **Reasoning fragility**: One uncertain hop in a chain invalidates entire result, but this only discovered at end

## Solution
Structured reasoning frame embedded in prompts and outputs:
- **Claim + Confidence** — Each factual assertion tagged with `confidence: 0..1` + `certainty_type: fact|inference|assumption`
- **Source tracking** — Facts cite original document/corpus; inferences note dependencies
- **Reasoning chain** — Intermediate steps logged (not just final answer)
- **Fallback signal** — If confidence below threshold, return `{ answer, fallback_answer, reasoning_gaps }`
- **Audit trail** — Every claim, source, and uncertainty level persisted for post-hoc analysis

Applied at LLM boundary: prompt template guides model to emit structured JSON; parser enforces schema; downstream consumers can filter by confidence or demand source.

## Key Patterns
1. **Confidence scoring** — Model outputs `{ claim, confidence: 0..1, reasoning: "...", source: "..." }` per statement
2. **Source attribution** — Link to corpus ID, doc name, cite text snippet — enable fact-checking
3. **Assumption tracking** — Explicitly list unstated premises ("assuming X is true because...") → test assumptions later
4. **Reasoning depth** — Intermediate reasoning steps formatted (premise 1, premise 2, conclusion) → easier to spot errors
5. **Fallback decision** — If any hop in chain has confidence < threshold, emit alternative path or escalate to human review
6. **Aggregate confidence** — For multi-step output, compute final confidence as product of step confidences (conservative)

## Output
- Prompt template: `buildReasoningPrompt(query, sources) → string` (instructs LLM to emit structured reasoning)
- Schema: `{ claim: string, confidence: number, certainty_type: enum, reasoning: string, sources: [{doc_id, snippet}], assumptions: string[] }`
- Parser: `parseReasoning(lmOutput) → structuredReasoning`
- Filter: `filterByConfidence(reasoning, threshold) → filteredClaims`

## Used in
- Sidix research agent (cite corpus; track reasoning hops)
- Migancore creative direction (uncertainty in visual choices; confidence in brand consistency)
- Any system where LLM output feeds downstream: medical research, legal analysis, content curation

---

*Open source — use it wisely.*
