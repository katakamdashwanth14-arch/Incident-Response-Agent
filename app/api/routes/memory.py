"""
FastAPI Routes for Persistent Memory (Stage 2 Integration).
Provides retain, recall, stats, and audit access to Hindsight agent memory.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.memory_service import memory_service

router = APIRouter(prefix="/memory", tags=["Incident Memory"])


class RetainRequest(BaseModel):
    incident_id: str
    service: str
    category: str = "General"
    symptoms: str
    root_cause: str
    resolution: str
    lessons_learned: str
    tags: Optional[List[str]] = Field(default_factory=list)
    evidence_links: Optional[List[str]] = Field(default_factory=list)


class RecallRequest(BaseModel):
    query: str
    tags: Optional[List[str]] = None
    limit: int = 5


@router.get("/stats")
async def get_memory_stats() -> Dict[str, Any]:
    """
    Get operational statistics and health of the Hindsight memory vault.
    """
    return memory_service.get_stats()


@router.get("/all")
async def get_all_memories() -> List[Dict[str, Any]]:
    """
    Retrieve all retained historical incident memories.
    """
    return memory_service.get_all()


@router.post("/recall")
async def recall_memories(payload: RecallRequest) -> List[Dict[str, Any]]:
    """
    Perform hybrid semantic recall across long-term incident memory.
    Returns ranked historical incidents with similarity scores and evidence correlations.
    """
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    
    return memory_service.recall(query=payload.query, tags=payload.tags, limit=payload.limit)


@router.post("/retain")
async def retain_memory(payload: RetainRequest) -> Dict[str, Any]:
    """
    Retain a structured incident post-mortem into persistent long-term memory.
    Extracts entities, causes, and resolutions to assist future triage.
    """
    result = memory_service.retain(
        incident_id=payload.incident_id,
        service=payload.service,
        category=payload.category,
        symptoms=payload.symptoms,
        root_cause=payload.root_cause,
        resolution=payload.resolution,
        lessons_learned=payload.lessons_learned,
        tags=payload.tags,
        evidence_links=payload.evidence_links,
    )
    return result
