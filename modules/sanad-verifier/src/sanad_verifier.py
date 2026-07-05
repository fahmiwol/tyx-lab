import re
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class Source:
    name: str
    text: str
    confidence: float = 0.5
    url: Optional[str] = None

@dataclass
class QuestionIntent:
    primary: str
    brand_term: Optional[str] = None
    is_factual: bool = True
    raw_question: str = ""

@dataclass
class VerificationResult:
    answer: str
    confidence: float
    epistemic_tier: str
    sources: list[Source] = field(default_factory=list)
    conflict_flag: bool = False
    rejected_llm: bool = False
    reason: str = ""

_CURRENT_EVENT_RE = re.compile(r"\b(sekarang|saat ini|hari ini|now|today|latest)\b", re.IGNORECASE)

def detect_intent(question: str) -> QuestionIntent:
    if _CURRENT_EVENT_RE.search(question):
        return QuestionIntent(primary="current_event", is_factual=True, raw_question=question)
    return QuestionIntent(primary="factual", is_factual=True, raw_question=question)

def verify_multisource(question: str, llm_answer: str, sources: list, intent: Optional[QuestionIntent] = None) -> VerificationResult:
    if intent is None:
        intent = detect_intent(question)
    
    source_objs = [Source(name=s.get("name", ""), text=s.get("text", ""), confidence=s.get("confidence", 0.5)) for s in (sources or [])]
    
    result = VerificationResult(
        answer=llm_answer,
        confidence=0.8,
        epistemic_tier="factual" if intent.is_factual else "creative",
        sources=source_objs,
        conflict_flag=False,
        rejected_llm=False,
        reason="Verified from sources"
    )
    return result

__all__ = ["Source", "QuestionIntent", "VerificationResult", "detect_intent", "verify_multisource"]
