import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_gemini_api_key, set_runtime_api_key, get_active_model
from app.models import (
    ConfigResponse, SetKeyRequest, EvaluationRequest, EvaluationResult,
    GenerateSentencesRequest, ProgressUpdateRequest
)
from app.storage import load_topics, load_progress, update_progress, add_sentences_to_topic
from app.gemini import evaluate_translation, generate_more_sentences

app = FastAPI(title="Daily English AI Tutor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=str(PUBLIC_DIR)), name="static")

@app.get("/")
async def serve_index():
    index_file = PUBLIC_DIR / "index.html"
    if not index_file.exists():
        return {"status": "ok", "message": "Daily English AI Tutor API running. Web UI loading..."}
    return FileResponse(str(index_file))

@app.get("/api/config", response_model=ConfigResponse)
async def get_config():
    key = get_gemini_api_key()
    return ConfigResponse(
        has_api_key=bool(key),
        active_model=get_active_model()
    )

@app.post("/api/config")
async def update_config(req: SetKeyRequest):
    if not req.api_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    set_runtime_api_key(req.api_key)
    return {"success": True, "message": "Gemini API key updated for current session"}

@app.get("/api/topics")
async def get_topics():
    topics = load_topics()
    return topics

@app.get("/api/progress")
async def get_progress():
    return load_progress()

@app.post("/api/progress")
async def post_progress(req: ProgressUpdateRequest):
    mistake_dict = req.mistake_item.model_dump() if req.mistake_item else None
    updated = update_progress(
        date_str=req.date,
        completed_inc=req.completed_increment,
        score=req.score,
        mistake_item=mistake_dict
    )
    return {"success": True, "progress": updated}

@app.post("/api/evaluate")
async def post_evaluate(req: EvaluationRequest):
    topics = load_topics()
    topic = next((t for t in topics if t["id"] == req.topic_id), None)
    topic_name = topic["name"] if topic else "General English"
    
    try:
        result = await evaluate_translation(
            topic_name=topic_name,
            vietnamese=req.vietnamese,
            user_english=req.user_english,
            is_voice=req.is_voice,
            custom_api_key=req.custom_api_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-sentences")
async def post_generate_sentences(req: GenerateSentencesRequest):
    try:
        new_sentences = await generate_more_sentences(
            topic_name=req.topic_name,
            count=req.count,
            custom_api_key=req.custom_api_key
        )
        if new_sentences:
            add_sentences_to_topic(req.topic_id, new_sentences)
        return {"success": True, "sentences": new_sentences}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import sys
    try:
        if sys.platform == "win32":
            sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    print(f"Daily English AI Tutor running at http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
