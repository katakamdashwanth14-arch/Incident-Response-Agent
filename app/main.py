"""
Incident Response Agent - FastAPI Backend Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, memory, investigate, webhooks, export
from app.core.config import settings


def create_application() -> FastAPI:
    """
    Factory function to initialize and configure the FastAPI application.
    Integrates all core services:
    - Health monitoring service
    - Hindsight persistent memory service (Stage 2)
    - Autonomous SRE investigation agent (Stage 3)
    - Webhook alert ingestion & demo scenarios (Stage 4)
    - Executive post-mortem export & notifications (Stage 5)
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="AI-powered incident response agent backend service",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS for frontend communication
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_origin_regex=r"^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API Routers
    app.include_router(health.router, prefix=settings.API_PREFIX)
    app.include_router(memory.router, prefix=settings.API_PREFIX)
    app.include_router(investigate.router, prefix=settings.API_PREFIX)
    app.include_router(webhooks.router, prefix=settings.API_PREFIX)
    app.include_router(export.router, prefix=settings.API_PREFIX)

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
