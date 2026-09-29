from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    service: str


@router.get("/health", response_model=HealthResponse)
async def check_health() -> HealthResponse:
    """
    Service health check endpoint.
    Returns status and service identifier.
    """
    return HealthResponse(
        status="ok",
        service="incident-response-agent"
    )
