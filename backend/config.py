import os
from dotenv import load_dotenv

load_dotenv()

# Portia Configuration
PORTIA_API_KEY = os.getenv("PORTIA_API_KEY", "")

# OpenAI Configuration (for GPT-5-mini)
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-mini")

# Database
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/construction_safety")

# FastAPI Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Safety Detection Configuration
OSHA_VIOLATION_TYPES = [
    "Missing PPE",
    "Fall Protection",
    "Scaffolding Safety", 
    "Equipment Safety"
]

# Report Recipients Configuration
SAFETY_REPORT_RECIPIENTS = [
    {"role": "Site Manager", "email": "site.manager@construction.com"},
    {"role": "Project Manager", "email": "project.manager@construction.com"},
    {"role": "Safety Officer", "email": "safety.officer@construction.com"},
    {"role": "OSHA Compliance", "email": "osha.compliance@construction.com"}
]
