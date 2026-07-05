"""
Self-Refining Agent Loop

Implements Tafakkur (تفكر — reflective self-improvement) pattern:
Thought → Action → Observation → Critique → Refine → (loop) → Final Answer

Pattern: Innovation-Criticism cycle prevents single-pass mediocrity.
Inspired by Islamic epistemology + modern Constitutional AI.
"""

from dataclasses import dataclass
from typing import Optional
import json


@dataclass
class CritiqueResult:
    """Critic agent output."""
    severity: str  # "info" | "warning" | "critical"
    score: float   # 0.0-1.0
    issues: list[str]
    suggested_improvements: list[str]
    overall_judgment: str


class SelfRefineLoop:
    """
    Dual-agent quality loop.
    
    Usage:
        loop = SelfRefineLoop(llm_client=your_llm)
        result = loop.refine(
            request="Create a product landing page headline",
            initial_output="Best Product Ever",
            max_iterations=3
        )
    """
    
    def __init__(self, llm_client, critic_modes=None):
        self.llm = llm_client
        self.critic_modes = critic_modes or ["quality_check", "devil_advocate"]
        self.history = []
    
    def refine(self, request: str, initial_output: str, max_iterations: int = 3):
        """
        Iteratively refine output through critique loop.
        
        Args:
            request: Original user request
            initial_output: First-pass output
            max_iterations: Max refine cycles (default 3)
        
        Returns:
            {
                "final_output": str,
                "score": float,
                "iterations": int,
                "critiques": List[CritiqueResult],
                "satisfactory": bool
            }
        """
        current = initial_output
        critiques = []
        iteration = 0
        
        for iteration in range(max_iterations):
            # Step 1: Critique current output
            critique = self._critique(current, request, iteration)
            critiques.append(critique)
            self.history.append({
                "iteration": iteration,
                "output": current,
                "critique": critique.__dict__
            })
            
            # Step 2: Decide: refine or accept?
            if critique.score >= 0.8 or critique.severity == "info":
                # Good enough
                return {
                    "final_output": current,
                    "score": critique.score,
                    "iterations": iteration + 1,
                    "critiques": [c.__dict__ for c in critiques],
                    "satisfactory": True
                }
            
            # Step 3: Refine based on critique
            if iteration < max_iterations - 1:
                current = self._refine(current, critique, request)
        
        # Max iterations reached
        return {
            "final_output": current,
            "score": critiques[-1].score if critiques else 0.0,
            "iterations": max_iterations,
            "critiques": [c.__dict__ for c in critiques],
            "satisfactory": False  # Capped at max iterations
        }
    
    def _critique(self, output: str, context: str, iteration: int) -> CritiqueResult:
        """
        Run critique in selected mode (round-robin).
        """
        mode = self.critic_modes[iteration % len(self.critic_modes)]
        
        prompt = f"""You are a critical evaluator using {mode} mode.
        
Context: {context}
Current Output: {output[:800]}

Evaluate this output as JSON:
{{
  "severity": "info|warning|critical",
  "score": 0.0-1.0,
  "issues": ["issue 1", "issue 2"],
  "suggested_improvements": ["improvement 1", "improvement 2"],
  "overall_judgment": "1-2 sentence summary"
}}"""
        
        response = self.llm.generate(prompt)
        try:
            data = json.loads(response)
            return CritiqueResult(
                severity=data.get("severity", "info"),
                score=float(data.get("score", 0.5)),
                issues=data.get("issues", []),
                suggested_improvements=data.get("suggested_improvements", []),
                overall_judgment=data.get("overall_judgment", "")
            )
        except json.JSONDecodeError:
            return CritiqueResult(
                severity="warning",
                score=0.5,
                issues=["Could not parse critique"],
                suggested_improvements=[],
                overall_judgment=""
            )
    
    def _refine(self, output: str, critique: CritiqueResult, context: str) -> str:
        """
        Generate refined version based on critique.
        """
        improvements = "\n".join(f"- {i}" for i in critique.suggested_improvements)
        
        prompt = f"""Refine this output based on feedback:

Original Context: {context}
Current Output: {output[:800]}

Issues Found: {', '.join(critique.issues)}

Required Improvements:
{improvements}

Generate improved version (same format/length):"""
        
        return self.llm.generate(prompt)
