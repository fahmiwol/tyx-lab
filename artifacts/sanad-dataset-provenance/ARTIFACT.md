# Dataset Provenance: The Sanad Method (Certification Chain)

**Version:** 1.0.0 | **Category:** AI/Research | **Status:** stable

## Overview

A provenance tracking methodology for training datasets inspired by Islamic "sanad" (chain of transmission). Every data point has a verifiable chain from source → collection → validation → usage, enabling:
- **Trust auditing:** Can trace who collected, who approved, who used this data
- **Quality attribution:** Link dataset quality to specific collectors/validators
- **Reproducibility:** Re-run experiments with exactly the same data subset
- **Regulatory compliance:** GDPR/privacy: track consent and usage

## The Sanad Chain

```
Original Source (User Chat / User-Generated Content)
  ↓ [Timestamp, User ID, Tenant, Collection Method]
Data Collector (Automated Extraction / Manual Curation)
  ↓ [Extractor ID, Extraction Config, Dedupe Hash]
Data Validator (QA Human / Judge Model)
  ↓ [Validator ID, Quality Score, Feedback]
Dataset Snapshot (Version Tag, Export Date)
  ↓ [Export ID, Format, Row Count, Checksum]
Training Run (DPO/SFT with Subset)
  ↓ [Model Version, Trainer ID, Data Subset Used, Result]
Production Model (deployed)
  ↓ [User Feedback, Eval Gate Result]
```

Each link in the chain is **immutable, signed, timestamped**. A chain break = red flag for data contamination.

## Data Schema (Sanad-Enhanced)

```json
{
  "data_id": "dp-20260511-001",
  "original_source": {
    "type": "user_chat_turn",
    "source_id": "conversation-xyz",
    "user_id": "user-123",
    "tenant_id": "tenant-456",
    "timestamp": "2026-05-11T14:32:10Z",
    "collection_method": "auto_extract_from_cai_pipeline"
  },
  "collection_event": {
    "collector_id": "data_collector_v1",
    "collection_timestamp": "2026-05-11T14:32:15Z",
    "extraction_config": {
      "rule": "extract_preference_pair_if_critique_provided",
      "dedupe_hash": "sha256:abcd1234..."
    }
  },
  "validation_event": {
    "validator_id": "judge_model_v2",
    "validation_timestamp": "2026-05-11T14:33:00Z",
    "quality_score": 4.0,
    "feedback": "Well-structured preference pair, high confidence"
  },
  "dataset_snapshot": {
    "snapshot_id": "dpo_export_20260511_v1",
    "export_timestamp": "2026-05-11T18:00:00Z",
    "checksum_sha256": "xyz789..."
  },
  "training_usage": {
    "training_run_id": "train-run-20260512-01",
    "model_version": "migancore:0.5",
    "result": "win_rate_0.72"
  }
}
```

## Storage Architecture

```sql
CREATE TABLE data_provenance (
  data_id TEXT PRIMARY KEY,
  original_source JSONB,
  collection_event JSONB,
  validation_event JSONB,
  dataset_snapshot JSONB,
  training_usage JSONB,
  production_feedback JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Audit Queries

**Find all data used to train a specific model:**
```sql
SELECT data_id, validation_event->>'quality_score' as score
FROM data_provenance
WHERE training_usage->>'model_version' = 'migancore:0.5'
ORDER BY validation_event->>'quality_score' DESC;
```

**Quality timeline: Did data quality degrade over time?**
```sql
SELECT 
  DATE_TRUNC('day', collection_event->>'collection_timestamp') as date,
  AVG((validation_event->>'quality_score')::numeric) as avg_score,
  COUNT(*) as count
FROM data_provenance
GROUP BY DATE_TRUNC('day', collection_event->>'collection_timestamp')
ORDER BY date DESC;
```

## Why This Matters

1. **Trustworthiness:** Can prove "this data came from real users, was validated, used to train this model."
2. **Debugging:** When a model has a bug, trace it back to problematic training data.
3. **Reproducibility:** Re-train from exact same data subset if needed.
4. **Regulatory:** "Where did this data come from?" is answerable with certainty.
5. **Attribution:** Reward good data collectors; identify bad ones.

*Open source — use it wisely.*
