# Usage

```python
from reasoning_bank import ReasoningBank

bank = ReasoningBank("data/reasoning_bank.json")

# 1) WRITE — when the user thumbs-downs with a typed correction:
bank.record_from_correction(
    prompt_text="100 tons is how many kg?",
    correction="answer the number directly, use local thousand-separator format",
    intent="business_analysis",   # optional; from your intent classifier
)

# 2) READ — before building the system prompt for a new message:
matches = bank.retrieve(user_message, query_intent=intent_label, limit=2)
block = bank.format_context(matches)
if block:
    system_prompt += "\n\n" + block

# 3) SEED — distill your documented failure classes into starter lessons:
bank.record(intent="coding",
            trigger="still wrong fix the shape where is it polish",
            strategy="When the user gives repair feedback on an artifact you just made, "
                     "repair the SAME artifact — don't change topic or restart from zero.",
            outcome="failed", source="seed:incident-2026-07")
```

Wiring rules that kept production safe:
- Wrap every call in try/except at the call site — a bank bug must never break chat.
- Gate with a flag (`off|shadow|on`); in shadow, retrieve+log but return "".
- If the bank can contain private user text, inject for the owner/creator only.
- If the JSON lives on a container volume, make sure the RUNTIME uid can write it
  (test with the actual service uid, not `docker exec` default root).
