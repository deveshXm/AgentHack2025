import os
from functools import lru_cache


class Settings:
    app_name: str = "PT Prior-Auth Orchestrator"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    # Azure OpenAI (OCR)
    azure_openai_api_key: str | None = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_endpoint: str | None = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_openai_deployment: str | None = os.getenv("AZURE_OPENAI_DEPLOYMENT")

    # OpenAI (Realtime / generic LLM if needed)
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")

    # Twilio (voice)
    twilio_account_sid: str | None = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_auth_token: str | None = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number: str | None = os.getenv("TWILIO_NUMBER")
    public_wss_url: str | None = os.getenv("PUBLIC_WSS_URL")

    # Mongo
    mongodb_uri: str = os.getenv("MONGODB_URI", "")
    mongodb_db: str = os.getenv("MONGODB_DB", "pa_demo")


@lru_cache
def get_settings() -> Settings:
    return Settings()


