"""Minimal end-to-end: seed two lessons, retrieve for a real-shaped query."""
import sys, tempfile, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
from reasoning_bank import ReasoningBank

bank = ReasoningBank(pathlib.Path(tempfile.mkdtemp()) / "bank.json")
bank.record(intent="coding",
            trigger="still wrong fix shape missing polish artifact",
            strategy="Repair feedback on a just-made artifact means: fix the SAME artifact.",
            outcome="failed", source="seed:demo")
bank.record(intent="business_analysis",
            trigger="margin ideal percent estimate price target",
            strategy="If you lack specific data for a requested number, say so honestly "
                     "and offer to look it up — never invent a number.",
            outcome="proven", source="seed:demo")

for q, intent in [("the shape is still wrong, fix it", "coding"),
                  ("what's an ideal margin percent for exports?", "business_analysis"),
                  ("good morning!", "chat")]:
    m = bank.retrieve(q, intent)
    print(f"{q!r:50} -> {len(m)} match(es)")
    if m:
        print(bank.format_context(m), "\n")
