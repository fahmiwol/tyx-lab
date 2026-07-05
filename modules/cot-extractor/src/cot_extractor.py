import re
from dataclasses import dataclass, field

REASONING_BLOCK_PATTERN = r"<REASONING>\s*(.*?)\s*</REASONING>"
ANSWER_BLOCK_PATTERN = r"<ANSWER>\s*(.*?)\s*</ANSWER>"
EPISTEMIK_LABELS = {"FACT", "OPINION", "SPECULATION", "UNKNOWN"}
EPISTEMIK_PATTERN = r"\[(" + "|".join(EPISTEMIK_LABELS) + r")\]"

@dataclass
class CoTOutput:
    reasoning: str
    answer: str
    epistemic_labels: dict[str, int] = field(default_factory=dict)
    label_coverage: float = 0.0
    confidence: float = 0.0
    reasoning_quality: str = "adequate"
    warnings: list[str] = field(default_factory=list)
    is_valid: bool = True

def extract_reasoning_block(text: str) -> str:
    match = re.search(REASONING_BLOCK_PATTERN, text, re.DOTALL)
    return match.group(1).strip() if match else ""

def extract_answer_block(text: str) -> str:
    match = re.search(ANSWER_BLOCK_PATTERN, text, re.DOTALL)
    return match.group(1).strip() if match else ""

def extract_epistemic_labels(text: str) -> dict[str, int]:
    matches = re.findall(EPISTEMIK_PATTERN, text.upper())
    result = {label: 0 for label in EPISTEMIK_LABELS}
    for m in matches:
        if m in result:
            result[m] += 1
    return result

def extract_and_validate(llm_output: str) -> CoTOutput:
    reasoning = extract_reasoning_block(llm_output)
    answer = extract_answer_block(llm_output)
    labels = extract_epistemic_labels(llm_output)
    
    quality = "weak" if len(reasoning) < 100 else ("strong" if len(reasoning) > 300 else "adequate")
    confidence = min(1.0, len(reasoning) / 500.0)
    
    return CoTOutput(reasoning=reasoning, answer=answer, epistemic_labels=labels, 
                    confidence=confidence, reasoning_quality=quality, is_valid=bool(reasoning and answer))

__all__ = ["CoTOutput", "extract_and_validate"]
