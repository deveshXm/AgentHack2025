from __future__ import annotations

import json
import base64
import os
from typing import Dict, Any

from app.config import get_settings


OCR_SCHEMA_INSTRUCTION = (
    """
Return ONLY minified JSON matching this schema:
{
  "patient": {"firstName":"", "lastName":"", "dob":"YYYY-MM-DD"},
  "insurance": {"payerName":"", "planName":"", "groupNumber":null, "memberId":"", "subscriberName":""},
  "clinical": {"icd10Code":"", "cptCodes":[], "visitsRequested":0},
  "provider": {"referringProviderName":"", "referringProviderNpi":"", "siteOfCare":""}
}
If unknown, use null or empty string. Do not add extra keys.
"""
).strip()


def _to_data_uri_if_local(url_or_path: str) -> str:
    """Convert file:// or local path to a data URI for Azure Chat image input.

    Supports common image formats and PDFs (passed as application/pdf).
    """
    if url_or_path.startswith("file://"):
        local_path = url_or_path[len("file://"):]
    elif os.path.exists(url_or_path):
        local_path = url_or_path
    else:
        return url_or_path

    ext = os.path.splitext(local_path.lower())[1]
    mime = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
    }.get(ext, "application/octet-stream")
    with open(local_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:{mime};base64,{b64}"


async def extract_fields_with_azure(image_url: str) -> Dict[str, Any]:
    """Call Azure OpenAI GPT-5 multimodal chat completions for OCR.

    image_url can be a local file path served via file:// or a presigned URL;
    for local demo, upstream will pass a file:// path handled by the client SDK
    or convert to base64 outside this function.
    """
    settings = get_settings()
    if not (settings.azure_openai_api_key and settings.azure_openai_endpoint and settings.azure_openai_deployment):
        # Return empty structure if misconfigured (keeps pipeline running)
        return _empty_payload()

    try:
        # Lazy import to avoid mandatory dependency during tests
        from openai import AzureOpenAI

        client = AzureOpenAI(
            api_key=settings.azure_openai_api_key,
            azure_endpoint=settings.azure_openai_endpoint,
            api_version="2024-06-01",
        )

        resp = client.chat.completions.create(
            model=settings.azure_openai_deployment,
            messages=[
                {"role": "system", "content": "You are an OCR and form extraction assistant."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": OCR_SCHEMA_INSTRUCTION},
                        {"type": "image_url", "image_url": {"url": _to_data_uri_if_local(image_url)}},
                    ],
                },
            ],
            temperature=0,
        )
        text = resp.choices[0].message.content
        data = json.loads(text)
        return data
    except Exception:
        return _empty_payload()


def apply_defaults(payload: Dict[str, Any]) -> Dict[str, Any]:
    clinical = payload.setdefault("clinical", {})
    if not clinical.get("cptCodes"):
        clinical["cptCodes"] = ["97161", "97110"]
    if not clinical.get("icd10Code"):
        clinical["icd10Code"] = "M25.561"
    if not clinical.get("visitsRequested"):
        clinical["visitsRequested"] = 8
    return payload


def _empty_payload() -> Dict[str, Any]:
    return {
        "patient": {"firstName": "", "lastName": "", "dob": ""},
        "insurance": {"payerName": "", "planName": "", "groupNumber": None, "memberId": "", "subscriberName": ""},
        "clinical": {"icd10Code": "", "cptCodes": [], "visitsRequested": 0},
        "provider": {"referringProviderName": "", "referringProviderNpi": "", "siteOfCare": ""},
    }


