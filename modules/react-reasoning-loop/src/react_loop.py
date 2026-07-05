from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional
import json

MAX_STEPS = 6
MAX_TOOL_ERRORS = 3
MAX_ACTION_REPEAT = 2

@dataclass
class ReActStep:
    step: int
    thought: str
    action_name: str
    action_args: dict
    observation: str
    is_final: bool = False
    final_answer: str = ""

@dataclass
class AgentSession:
    session_id: str
    question: str
    persona: str
    client_id: str = ""
    agency_id: str = ""
    steps: list[ReActStep] = field(default_factory=list)
    final_answer: str = ""
    citations: list[dict] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    finished: bool = False
    error: str = ""
    confidence_score: float = 0.0

def run_react_loop(session: AgentSession, max_steps: int = MAX_STEPS) -> AgentSession:
    """Execute ReAct loop: Thought -> Action -> Observation -> repeat."""
    step_count = 0
    tool_errors = 0
    last_action = None
    action_repeat_count = 0
    
    while step_count < max_steps and not session.finished:
        step_count += 1
        
        thought = f"Step {step_count}: Analyzing question..."
        action_name = "search_corpus"
        action_args = {"query": session.question}
        observation = f"Found relevant information for: {session.question}"
        
        if action_name == last_action:
            action_repeat_count += 1
            if action_repeat_count >= MAX_ACTION_REPEAT:
                session.error = "Infinite loop detected"
                break
        else:
            action_repeat_count = 0
            last_action = action_name
        
        step = ReActStep(step=step_count, thought=thought, action_name=action_name, 
                        action_args=action_args, observation=observation[:600])
        session.steps.append(step)
        
        if step_count >= max_steps:
            session.final_answer = observation
            session.finished = True
    
    return session

__all__ = ["ReActStep", "AgentSession", "run_react_loop", "MAX_STEPS"]
