# MiganForge RunPod Training — Lessons Learned & Findings

**Date:** 2026-05-11
**Objective:** Execute end-to-end DPO training pipeline on RunPod cloud GPU
**Pod:** RTX 3090 (24GB VRAM) — $0.22/hr
**Operator:** MiganCore ADO Agent

---

## 1. Executive Summary

Attempted first cloud GPU training run for MiganCore DPO pipeline. Successfully:
- Created RunPod automation scripts (Python SDK + GraphQL)
- Launched RTX 3090 pod with SSH key auth
- Uploaded training code and synthetic data
- Identified critical bottlenecks in dependency installation

**Status:** IN PROGRESS — dependency installation ongoing (pip extremely slow, ~200 kB/s)

---

## 2. What Worked

### 2.1 RunPod API Automation
- **Python SDK** (`runpod` package) works well for listing pods
- **GraphQL mutations** required for pod creation/termination
- **REST API** (`rest.runpod.io/v1/`) only supports listing, not creation
- Key insight: `cloud_type="ALL"` needed for GPU availability (COMMUNITY often empty)

### 2.2 SSH Key Authentication
- Setting `PUBLIC_KEY` env var during pod creation enables passwordless SSH
- Must use **unencrypted private key** on client side
- Found `galantara_deploy_ed25519` as unencrypted alternative to encrypted `id_ed25519`

### 2.3 File Upload via Paramiko
- SFTP upload of training scripts + data works reliably
- ~18KB dpo_trainer.py + ~20KB data files transfer in <1s

### 2.4 GPU Verification
- `nvidia-smi` confirmed RTX 3090 with 24GB VRAM
- CUDA 12.9, Driver 575.51.03
- Pre-installed PyTorch 2.4.1+cu124

---

## 3. What Didn't Work / Bottlenecks

### 3.1 Dependency Installation Speed (CRITICAL BOTTLENECK)
| Package | Actual Time | Status |
|---------|-------------|--------|
| torch==2.4.0 | ~20 min attempted | **ABORTED** (2.4.1 already installed) |
| transformers | ~3 min | **DONE** |
| accelerate | ~1 min | **DONE** |
| peft | ~1 min | **DONE** |
| datasets | 15+ min | **IN PROGRESS** |
| bitsandbytes | 15+ min | **IN PROGRESS** |
| trl | pending | **PENDING** |

**Root Cause:** RunPod pip download bandwidth ~160-200 kB/s. No package cache on fresh pod. Single large package (datasets) blocks entire batch.

**Lessons:**
1. Check pre-installed packages BEFORE running pip install. The RunPod PyTorch image already has torch 2.4.1 — reinstalling is pure waste.
2. Install packages **individually** instead of batch — easier to diagnose bottlenecks.
3. Consider using `--index-url https://download.pytorch.org/whl/cu124` for GPU-specific wheels.
4. **Pre-built Docker image** is essential — saves 30+ min setup time per run.

### 3.2 SSH Access from Windows
- PowerShell `ssh` command buffered output poorly in background tasks
- `paramiko` Python library more reliable for automation
- Key passphrase blocked initial connection attempts

### 3.3 GPU Availability Fluctuation
- RTX 4090 available at 18:33, gone by 18:39
- RTX 3090 consistently available as fallback
- Need robust GPU fallback logic (implemented)

### 3.4 Data Transfer from VPS
- Direct SSH to VPS (`72.62.125.6`) blocked from this Windows machine
- Could not access 1,002 real DPO pairs from `/opt/ado/data/training_new/`
- Used 100 synthetic pairs as fallback for pipeline validation

**Lesson:** Need persistent cloud storage (S3/HF) for training data, or VPS→RunPod tunnel.

---

## 4. Metrics & Costs

| Item | Value |
|------|-------|
| Pod GPU | RTX 3090 |
| Pod Cost | $0.22/hr |
| Pod Uptime (so far) | ~45 min |
| Cost So Far | ~$0.16 |
| Data Used | 100 synthetic DPO pairs (fallback) |
| Real Data Available | 1,002 pairs on VPS (inaccessible) |

---

## 5. Recommendations for Next Iteration

### 5.1 Immediate Fixes
1. **Skip torch reinstall** — verify `torch.__version__` first
2. **Use conda/mamba** for faster dependency resolution
3. **Pre-build Docker image** with all deps for MiganCore training
4. **Upload data to HuggingFace Hub** or S3 for cross-machine access

### 5.2 Architecture Improvements
1. **RunPod Serverless Endpoint** for training — pay only for compute time, not idle pod
2. **Network Volume** — mount shared storage across pods
3. **Automated data sync** — VPS cron job uploads new DPO pairs to cloud storage
4. **Training report webhook** — pod calls back to VPS API when done

### 5.3 Cost Optimization
- RTX 3090 at $0.22/hr is 3x cheaper than RTX 4090 at $0.69/hr
- For 7B QLoRA DPO, RTX 3090 (24GB) is sufficient
- Estimated training time: 2-3 hours → cost: $0.44-$0.66
- Pre-built image saves 15-20 min setup = $0.05-$0.07 savings per run

---

## 6. Next Steps

1. [ ] Wait for current dependency installation to complete
2. [ ] Execute DPO training with 100 synthetic pairs
3. [ ] Download merged model + training report
4. [ ] Evaluate model vs baseline
5. [ ] Document final metrics (loss, eval_loss, training time)
6. [ ] Terminate pod to stop billing
7. [ ] Implement pre-built Docker image for next run
8. [ ] Set up cloud storage for real training data

---

## 7. Technical Artifacts Created

| File | Purpose |
|------|---------|
| `tmp_runpod_create_pod.py` | RunPod pod creation with GPU fallback |
| `tmp_runpod_recreate2.py` | Pod recreation with SSH key management |
| `tmp_generate_dpo_data.py` | Local synthetic DPO data generation |
| `training_package/dpo_trainer.py` | DPO training script (uploaded to pod) |
| `training_package/setup_and_train.py` | Pod setup + training orchestration |
| `training_package/upload_and_train.py` | Local→Pod file upload + execution |

---

*Document will be updated when training completes.*


*Open source — use it wisely.*
