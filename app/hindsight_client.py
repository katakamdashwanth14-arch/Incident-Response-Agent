"""
Hindsight Persistent Memory Client Abstraction.

Prepared for Stage 2 & Stage 3 integration.
Wraps the official `hindsight-client` Python SDK to manage long-term incident memory:
- retain_incident: embeds and registers post-mortems, root causes, and resolutions
- recall_incidents: multi-strategy recall (vector, keyword, graph, temporal)
"""

import os
from typing import Any, Dict, List, Optional
from datetime import datetime
import logging

try:
    from hindsight_client import Hindsight
except ImportError:
    Hindsight = None  # Fallback if package is missing in environment

logger = logging.getLogger(__name__)

DEFAULT_BANK_ID = "incident-response-bank"


class HindsightMemoryClient:
    """
    Client wrapper for Hindsight persistent agent memory service.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        bank_id: str = DEFAULT_BANK_ID,
        timeout: float = 300.0,
    ):
        self.base_url = base_url or os.getenv("HINDSIGHT_API_URL", "http://localhost:8888")
        self.api_key = api_key or os.getenv("HINDSIGHT_API_KEY", None)
        self.bank_id = bank_id
        self.timeout = timeout
        self._client: Optional[Any] = None

    @property
    def client(self):
        """Lazy initializer for the official Hindsight client."""
        if self._client is None:
            if Hindsight is None:
                raise ImportError(
                    "The 'hindsight-client' package is required. Install it using 'pip install hindsight-client'."
                )
            self._client = Hindsight(
                base_url=self.base_url,
                api_key=self.api_key,
                timeout=self.timeout,
            )
        return self._client

    def is_healthy(self) -> bool:
        """
        Check if the Hindsight API service is reachable.
        """
        try:
            version_info = self.client.get_version()
            return version_info is not None
        except Exception as e:
            logger.warning(f"Hindsight health check failed: {e}")
            return False

    def retain_incident(
        self,
        incident_id: str,
        service: str,
        symptoms: str,
        root_cause: str,
        resolution: str,
        lessons_learned: str,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
    ) -> Any:
        """
        Store a structured incident post-mortem into Hindsight persistent memory.

        Args:
            incident_id: Unique incident identifier (e.g., INC-024, TEST-001)
            service: Target service / microservice name
            symptoms: Observed anomaly, HTTP errors, or failure indicators
            root_cause: The verified underlying technical defect
            resolution: Immediate mitigations and fixes applied
            lessons_learned: Architectural and operational takeaways
            metadata: Additional key-value metadata pairs
            tags: List of tags for classification (e.g. ['payment', 'database', 'P1'])
        """
        content = (
            f"Incident ID: {incident_id}\n"
            f"Service: {service}\n"
            f"Symptoms: {symptoms}\n"
            f"Root Cause: {root_cause}\n"
            f"Resolution: {resolution}\n"
            f"Lessons Learned: {lessons_learned}"
        )

        combined_metadata = {
            "incident_id": incident_id,
            "service": service,
            **(metadata or {}),
        }

        combined_tags = list(set([service.lower(), incident_id.lower()] + (tags or [])))

        logger.info(f"Retaining incident {incident_id} to Hindsight bank '{self.bank_id}'")
        return self.client.retain(
            bank_id=self.bank_id,
            content=content,
            document_id=incident_id,
            metadata=combined_metadata,
            tags=combined_tags,
        )

    def recall_incidents(
        self,
        query: str,
        tags: Optional[List[str]] = None,
        max_tokens: int = 4096,
    ) -> Any:
        """
        Query Hindsight memory using multi-strategy parallel recall.

        Args:
            query: Natural language symptom or error description
            tags: Optional tags to filter recall candidates
            max_tokens: Maximum tokens in recall budget
        """
        logger.info(f"Recalling incident memory for query: '{query}'")
        return self.client.recall(
            bank_id=self.bank_id,
            query=query,
            tags=tags,
            max_tokens=max_tokens,
        )


# Default singleton instance for import in FastAPI routers/services in Stage 3
hindsight_memory = HindsightMemoryClient()
