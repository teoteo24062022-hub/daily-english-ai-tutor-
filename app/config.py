import os
from dotenv import load_dotenv

load_dotenv()

# Runtime key storage (if user inputs via Web UI)
_runtime_api_key: str = ""

def get_gemini_api_key() -> str:
    """Returns runtime API key or environment variable GEMINI_API_KEY."""
    return _runtime_api_key or os.getenv("GEMINI_API_KEY", "").strip()

def set_runtime_api_key(key: str) -> None:
    global _runtime_api_key
    _runtime_api_key = key.strip()

def get_active_model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
