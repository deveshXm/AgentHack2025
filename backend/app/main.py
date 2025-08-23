from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes.health import router as health_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="PT Prior-Auth Orchestrator (Sandboxed)",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="")

    @app.get("/")
    def root():
        return {
            "name": "pt-prior-auth-orchestrator",
            "env": settings.app_env,
            "version": "0.1.0",
            "status": "ok",
        }

    return app


app = create_app()


