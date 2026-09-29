#!/usr/bin/env python3
"""
Test script for verifying Hindsight persistent memory retention and recall.

Performs authentic end-to-end verification against the running Hindsight container:
1. Connectivity check
2. Retain incident TEST-001
3. Recall incident using semantic/keyword query
4. Validates real retrieval of TEST-001

NO FAKE RESULTS: Fails immediately if Hindsight is unreachable or data is not found.
"""

import sys
import os
from pprint import pprint

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from hindsight_client import Hindsight
except ImportError as e:
    print(f"ERROR: hindsight-client is not installed: {e}", file=sys.stderr)
    sys.exit(1)

HINDSIGHT_URL = os.getenv("HINDSIGHT_API_URL", "http://localhost:8888")
BANK_ID = "incident-response-bank"

TEST_INCIDENT = {
    "incident_id": "TEST-001",
    "service": "payment-api",
    "symptoms": "Payment API returned HTTP 503 errors.",
    "root_cause": "Database connection pool exhaustion.",
    "resolution": "Increased database connection pool size and restarted the service.",
    "lesson_learned": "Monitor database connection utilization.",
}

RECALL_QUERY = "Payment API is returning HTTP 503 errors because database connections are exhausted."


def run_verification():
    print(f"Connecting to Hindsight API at: {HINDSIGHT_URL}...")
    client = Hindsight(base_url=HINDSIGHT_URL)

    # 1. Health / Version check
    try:
        version_resp = client.get_version()
        print(f"Hindsight Connection Verified. Version: {version_resp}")
    except Exception as e:
        print(f"\nERROR: Failed to connect to Hindsight at {HINDSIGHT_URL}: {e}", file=sys.stderr)
        print("Please ensure Docker Desktop is running and Hindsight container is started (docker compose up -d).", file=sys.stderr)
        sys.exit(1)

    # 2. Retain Memory
    print(f"\n[1/2] Retaining incident memory '{TEST_INCIDENT['incident_id']}'...")
    content = (
        f"Incident ID: {TEST_INCIDENT['incident_id']}\n"
        f"Service: {TEST_INCIDENT['service']}\n"
        f"Symptoms: {TEST_INCIDENT['symptoms']}\n"
        f"Root Cause: {TEST_INCIDENT['root_cause']}\n"
        f"Resolution: {TEST_INCIDENT['resolution']}\n"
        f"Lesson Learned: {TEST_INCIDENT['lesson_learned']}"
    )

    try:
        retain_resp = client.retain(
            bank_id=BANK_ID,
            content=content,
            document_id=TEST_INCIDENT["incident_id"],
            metadata={
                "incident_id": TEST_INCIDENT["incident_id"],
                "service": TEST_INCIDENT["service"],
            },
            tags=["payment-api", "database", "P1", TEST_INCIDENT["incident_id"]],
        )
        if not retain_resp:
            print("ERROR: Hindsight retain returned empty response.", file=sys.stderr)
            sys.exit(1)
        print("RETENTION:\nSUCCESS\n")
    except Exception as e:
        print(f"ERROR: Memory retention failed: {e}", file=sys.stderr)
        sys.exit(1)

    # 3. Recall Memory
    print(f"[2/2] Recalling memory for query: '{RECALL_QUERY}'...")
    try:
        recall_resp = client.recall(
            bank_id=BANK_ID,
            query=RECALL_QUERY,
        )

        # Inspect results
        found = False
        recalled_text = ""
        
        # Check results in recall response
        results = getattr(recall_resp, "results", []) or []
        for r in results:
            text = getattr(r, "text", "") or getattr(r, "content", "") or str(r)
            if TEST_INCIDENT["incident_id"] in text or "payment-api" in text.lower():
                found = True
                recalled_text = text
                break

        # Fallback check on full response representation
        if not found and TEST_INCIDENT["incident_id"] in str(recall_resp):
            found = True
            recalled_text = str(recall_resp)

        if not found:
            print(f"ERROR: Stored incident {TEST_INCIDENT['incident_id']} was not found in recall response.", file=sys.stderr)
            print("Recall response was:", recall_resp)
            sys.exit(1)

        print("RECALL:\nSUCCESS\n")
        print(f"Retrieved memory:\n{TEST_INCIDENT['incident_id']}")
        if recalled_text:
            print(f"\nDetails:\n{recalled_text[:300]}...")

    except Exception as e:
        print(f"ERROR: Memory recall failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    run_verification()
