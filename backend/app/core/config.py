import os
from typing import Optional


class Settings:
    app_env: str = os.getenv("APP_ENV", "dev")

    # Azure OpenAI (OCR)
    azure_openai_api_key: Optional[str] = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_endpoint: Optional[str] = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_openai_deployment: Optional[str] = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5")

    # Portia
    portia_api_key: Optional[str] = os.getenv("PORTIA_API_KEY")

    # Storage
    base_dir: str = os.getenv("APP_BASE_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
    uploads_dir: str = os.getenv("UPLOADS_DIR", os.path.join(base_dir, "uploads"))
    data_dir: str = os.getenv("DATA_DIR", os.path.join(base_dir, "data"))
    db_path: str = os.getenv("DB_PATH", os.path.join(data_dir, "erp.sqlite3"))


settings = Settings()


