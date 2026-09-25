import os
from dotenv import load_dotenv

load_dotenv()

# Runtime key and model storage (if user inputs via Web UI)
_runtime_api_key: str = ""
_runtime_model: str = ""

def get_gemini_api_key() -> str:
    """Returns runtime API key or environment variable GEMINI_API_KEY."""
    return _runtime_api_key or os.getenv("GEMINI_API_KEY", "").strip()

def set_runtime_api_key(key: str) -> None:
    global _runtime_api_key
    _runtime_api_key = key.strip()

def get_active_model() -> str:
    return _runtime_model or os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()

def set_runtime_model(model: str) -> None:
    global _runtime_model
    _runtime_model = model.strip()


