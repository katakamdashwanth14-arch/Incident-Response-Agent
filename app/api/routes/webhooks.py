"""
FastAPI Routes for Webhook Alert Ingestion & Presentation Scenarios (Stage 4).
Allows triggering realistic outage simulations during hackathon demos and
ingesting real monitoring webhooks from Datadog, PagerDuty, or Prometheus.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.agent_service import agent_service

router = APIRouter(tags=["Webhooks & Scenarios"])


class OutageScenario(BaseModel):
    id: str
    name: str
    severity: str
    service: str
    description: str
    symptoms: str
    evidence: str
    impact: str


SCENARIOS = {
    "ap-db-pool": OutageScenario(
        id="ap-db-pool",
        name="PostgreSQL Connection Pool Saturation",
        severity="Critical",
        service="payment-api",
        description="Asia-Pacific database connection pool exhaustion causing cascading 503 gateway drops.",
        symptoms="API gateway returning 503 Service Unavailable under sudden traffic surge. Asia-Pacific region DB connection timeout.",
        evidence=(
            "PgBouncer active client pool: 100/100 (saturated)\n"
            "Queue depth: 420 pending client transactions\n"
            "HTTP 503 error rate: 14.8% across APAC edge gateways\n"
            "Database host CPU: 38% (I/O & connection bound)"
        ),
        impact="12,500 active checkout sessions failing across Asia-Pacific region",
    ),
    "stripe-webhook": OutageScenario(
        id="stripe-webhook",
        name="Stripe Webhook Gateway Timeout (504)",
        severity="High",
        service="checkout-service",
        description="Synchronous webhook handler thread starvation under retry storm.",
        symptoms="Stripe payment webhook delivery failure; 504 Gateway Timeout on incoming POST /v1/webhooks.",
        evidence=(
            "HTTP 504 Gateway Timeout on /v1/webhooks\n"
            "Stripe retry rate: 450 retries/sec\n"
            "Worker thread pool utilization: 100%\n"
            "Inventory lock duration: 11,400ms"
        ),
        impact="4,200 pending order confirmations delayed; customer receipts stalled",
    ),
    "kafka-lag": OutageScenario(
        id="kafka-lag",
        name="Kafka Partition Hot-Spotting & Consumer Lag",
        severity="High",
        service="analytics-pipeline",
        description="Hot partition key skew causing consumer pod OOM and rebalance storm.",
        symptoms="Kafka consumer group lag exceeded 850,000 events; streaming dashboard reporting stale metrics.",
        evidence=(
            "Kafka topic: telemetry-events-v2\n"
            "Partition #3 lag: 850,210 messages\n"
            "Consumer pod worker-3 status: OOMKilled (Exit Code 137)\n"
            "Group rebalancing in progress"
        ),
        impact="Real-time telemetry and merchant revenue dashboards delayed by 45 minutes",
    ),
}


class AlertWebhookPayload(BaseModel):
    source: str = "datadog"  # datadog, pagerduty, prometheus
    title: str
    service: str
    severity: str = "High"
    message: str
    raw_payload: Optional[Dict[str, Any]] = None


@router.get("/scenarios", response_model=List[OutageScenario])
async def list_scenarios() -> List[OutageScenario]:
    """
    List interactive presentation scenarios available for 1-click demonstration.
    """
    return list(SCENARIOS.values())


@router.post("/scenarios/trigger/{scenario_id}")
async def trigger_scenario(scenario_id: str) -> Dict[str, Any]:
    """
    Simulate a live production outage on-demand.
    Generates an incident ticket, links historical memory, and generates an AI investigation plan.
    """
    scenario = SCENARIOS.get(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")

    incident_id = f"INC-{int(datetime.utcnow().timestamp()) % 1000:03d}"

    # Execute autonomous investigation agent
    report = agent_service.analyze_incident(
        incident_id=incident_id,
        title=scenario.name,
        service=scenario.service,
        severity=scenario.severity,
        symptoms=scenario.symptoms,
        evidence=scenario.evidence,
        impact=scenario.impact,
    )

    return {
        "status": "triggered",
        "scenario": scenario.model_dump(),
        "incident": {
            "id": incident_id,
            "title": scenario.name,
            "service": scenario.service,
            "severity": scenario.severity,
            "symptoms": scenario.symptoms,
            "evidence": scenario.evidence,
            "impact": scenario.impact,
            "status": "Investigating",
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        },
        "investigation": report.model_dump(),
    }


@router.post("/webhooks/alert")
async def ingest_alert_webhook(payload: AlertWebhookPayload) -> Dict[str, Any]:
    """
    Ingest monitoring webhook from Datadog, PagerDuty, Prometheus, or Azure Monitor.
    Automatically parses the alert and spawns an AI investigation.
    """
    incident_id = f"ALERT-{int(datetime.utcnow().timestamp()) % 10000:04d}"

    report = agent_service.analyze_incident(
        incident_id=incident_id,
        title=payload.title,
        service=payload.service,
        severity=payload.severity,
        symptoms=payload.message,
    )

    return {
        "status": "alert_received",
        "incident_id": incident_id,
        "source": payload.source,
        "investigation_report": report.model_dump(),
    }
