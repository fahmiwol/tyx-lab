from enum import Enum, auto
from dataclasses import dataclass, field
from typing import Dict, List, Optional

class YaqinLevel(Enum):
    ILM_AL_YAQIN  = "ilm"
    AIN_AL_YAQIN  = "ain"
    HAQQ_AL_YAQIN = "haqq"

class EpistemicTier(Enum):
    MUTAWATIR  = "mutawatir"
    AHAD_HASAN = "ahad_hasan"
    AHAD_DHAIF = "ahad_dhaif"
    MAWDHU     = "mawdhu"

class AudienceRegister(Enum):
    BURHAN    = "burhan"
    JADAL     = "jadal"
    KHITABAH  = "khitabah"

class CognitiveMode(Enum):
    TAAQUL    = "taaqul"
    TAFAKKUR  = "tafakkur"
    TADABBUR  = "tadabbur"
    TADZAKKUR = "tadzakkur"

@dataclass
class SanadLink:
    source_id: str
    source_label: str
    adalah: float = 1.0
    dhabth: float = 1.0
    timestamp: Optional[str] = None
    location: Optional[str] = None
    metadata: Dict = field(default_factory=dict)
    
    @property
    def trust_score(self) -> float:
        return (self.adalah + self.dhabth) / 2.0

@dataclass
class KnowledgeClaim:
    statement: str
    yaqin_level: YaqinLevel
    epistemic_tier: EpistemicTier
    confidence: float
    sanad_chain: List[SanadLink] = field(default_factory=list)
    
    def is_reliable(self) -> bool:
        return self.epistemic_tier != EpistemicTier.MAWDHU

__all__ = ["YaqinLevel", "EpistemicTier", "AudienceRegister", "CognitiveMode", "SanadLink", "KnowledgeClaim"]
