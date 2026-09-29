"""
FastAPI Routes for Autonomous Investigation Agent (Stage 3 Integration).
Provides AI investigation analysis, memory correlation, and recovery generation.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.agent_service import agent_service, InvestigationReport

router = APIRouter(prefix="/investigate", tags=["Investigation Agent"])


class AnalyzeIncidentRequest(BaseModel):
    incident_id: str
    title: str
    service: str
    severity: str = "High"
    symptoms: str
    evidence: Optional[str] = None
    impact: Optional[str] = None


@router.post("/analyze", response_model=InvestigationReport)
async def analyze_incident(payload: AnalyzeIncidentRequest) -> InvestigationReport:
    """
    Trigger the Autonomous SRE Agent to investigate an active incident:
    1. Understands symptoms and diagnostic logs.
    2. Recalls matching historical post-mortems from persistent memory.
    3. Formulates the root-cause hypothesis and confidence rating.
    4. Generates a phased, executable recovery runbook.
    """
    if not payload.title.strip() or not payload.service.strip():
        raise HTTPException(status_code=400, detail="Incident title and service are required.")

    report = agent_service.analyze_incident(
        incident_id=payload.incident_id,
        title=payload.title,
        service=payload.service,
        severity=payload.severity,
        symptoms=payload.symptoms,
        evidence=payload.evidence,
        impact=payload.impact,
    )
    return report
