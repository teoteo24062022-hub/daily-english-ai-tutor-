import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_gemini_api_key, set_runtime_api_key, get_active_model, set_runtime_model
from app.models import (
    ConfigResponse, SetKeyRequest, EvaluationRequest, EvaluationResult,
    GenerateSentencesRequest, ProgressUpdateRequest,
    QuickCheckRequest, QuickCheckResult, CreateTopicRequest,
    VocabularyReviewRequest, AddCustomWordRequest, AiWordGenerateRequest, CompleteDayRequest,
    RoleplayChatRequest, RoleplayDebriefRequest, RoleplayDebriefResponse,
    StoryGenerateRequest, StoryGenerateResponse,
    PronunciationEvalRequest, PronunciationEvalResponse,
    AssistantAskRequest, AssistantAskResponse
)
from app.storage import (
    load_topics, load_progress, update_progress, add_sentences_to_topic, save_new_topic,
    load_vocabulary, update_vocab_review, add_vocab_item, load_roadmap, update_roadmap_progress
)
from app.gemini import (
    evaluate_translation, generate_more_sentences, quick_check_grammar,
    create_new_topic_with_gemini, generate_vocab_details,
    generate_roleplay_chat, generate_roleplay_debrief,
    generate_vocabulary_story, evaluate_pronunciation_diff,
    ask_instant_assistant
)

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
    if not req.api_key and not req.model:
        raise HTTPException(status_code=400, detail="Không có thông tin cấu hình để cập nhật")
    if req.api_key:
        set_runtime_api_key(req.api_key)
    if req.model:
        set_runtime_model(req.model)
    return {
        "success": True,
        "message": "Cập nhật cấu hình thành công",
        "has_api_key": bool(get_gemini_api_key()),
        "active_model": get_active_model()
    }

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

@app.post("/api/quick-check", response_model=QuickCheckResult)
async def post_quick_check(req: QuickCheckRequest):
    try:
        result = await quick_check_grammar(
            text=req.text,
            topic_name=req.topic_name or "General English",
            custom_api_key=req.custom_api_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/topics/create")
async def post_create_topic(req: CreateTopicRequest):
    if not req.topic_name.strip():
        raise HTTPException(status_code=400, detail="Tên chủ đề không được để trống")
    try:
        new_topic = await create_new_topic_with_gemini(
            topic_name=req.topic_name.strip(),
            category=req.category,
            count=req.count,
            custom_api_key=req.custom_api_key
        )
        save_new_topic(new_topic)
        return {"success": True, "topic": new_topic}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================================================
# VOCABULARY & FLASHCARDS SRS ENDPOINTS
# ========================================================

@app.get("/api/vocabulary")
async def get_vocabulary():
    """Lấy danh sách toàn bộ từ vựng và trạng thái SRS."""
    return load_vocabulary()

@app.post("/api/vocabulary/review")
async def post_vocabulary_review(req: VocabularyReviewRequest):
    """Cập nhật kết quả ôn tập flashcard (Again, Hard, Good, Easy) theo thuật toán SRS."""
    updated = update_vocab_review(req.vocab_id, req.grade)
    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy từ vựng")
    return {"success": True, "item": updated}

@app.post("/api/vocabulary/ai-generate")
async def post_vocabulary_ai_generate(req: AiWordGenerateRequest):
    """Dùng Gemini AI phân tích từ vựng: IPA, nghĩa, ví dụ đời sống & Tech, mẹo nhớ."""
    if not req.word.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập từ vựng")
    try:
        details = await generate_vocab_details(
            word=req.word,
            context_hint=req.context_hint,
            custom_api_key=req.custom_api_key
        )
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vocabulary/add")
async def post_vocabulary_add(req: AddCustomWordRequest):
    """Lưu từ vựng mới vào kho cá nhân."""
    if not req.word.strip() or not req.meaning.strip():
        raise HTTPException(status_code=400, detail="Từ vựng và nghĩa không được để trống")
    item = add_vocab_item(req.model_dump())
    return {"success": True, "item": item}

# ========================================================
# 3-MONTH (90-DAY) ROADMAP ENDPOINTS
# ========================================================

@app.get("/api/roadmap")
async def get_roadmap():
    """Lấy lộ trình 3 tháng (90 ngày) và tiến độ học tập."""
    return load_roadmap()

@app.post("/api/roadmap/complete-day")
async def post_roadmap_complete_day(req: CompleteDayRequest):
    """Đánh dấu hoàn thành bài học của một ngày trong lộ trình."""
    updated = update_roadmap_progress(req.day, completed=True)
    return {"success": True, "roadmap": updated}

# ========================================================
# 4 ADVANCED AI FEATURES ENDPOINTS
# ========================================================

ROLEPLAY_SCENARIOS = [
    {
        "id": "scenario-tech-interview",
        "title": "Phỏng Vấn AI/Tech Engineer",
        "badge": "Tuyển Dụng & Phỏng Vấn",
        "ai_role": "Alex - Lead AI Scientist (San Francisco)",
        "icon": "💼",
        "description": "Thực hành trả lời các câu hỏi kỹ thuật về Machine Learning, LLM, RAG pipeline, và giải quyết bài toán latency.",
        "opening_line": "Hello! Thanks for joining today's technical interview. To start off, could you briefly introduce your background and a recent project you worked on?"
    },
    {
        "id": "scenario-daily-standup",
        "title": "Agile Sprint Daily Standup",
        "badge": "Họp Nhóm Công Nghệ",
        "ai_role": "Sarah - Scrum Master & Tech Lead",
        "icon": "⚡",
        "description": "Báo cáo 3 mục tiêu: việc đã làm hôm qua, kế hoạch hôm nay, và tháo gỡ điểm nghẽn (blocker).",
        "opening_line": "Good morning everyone! Let's get our standup started. What did you work on yesterday, and what are you planning to tackle today?"
    },
    {
        "id": "scenario-bug-triage",
        "title": "Production Incident Post-Mortem",
        "badge": "Xử Lý Sự Cố Khẩn",
        "ai_role": "Dave - Senior SRE Engineer",
        "icon": "🚨",
        "description": "Họp khẩn mổ xẻ nguyên nhân sự cố sập server (RCA), nghẽn cổ chai database và đề xuất phương án dự phòng.",
        "opening_line": "Hey! We just got alerted that API p99 latency jumped to 4 seconds and error rates are climbing. What do the database metrics and logs show?"
    },
    {
        "id": "scenario-architecture",
        "title": "System Architecture Debate",
        "badge": "Tranh Luận Kỹ Thuật",
        "ai_role": "Elena - Chief Technology Officer (CTO)",
        "icon": "📐",
        "description": "Tranh luận về sự đánh đổi (trade-off) giữa độ chính xác của mô hình AI và chi phí phần cứng suy luận.",
        "opening_line": "Thanks for meeting. We need to decide on our inference architecture before the end of the sprint. What's your recommendation regarding the trade-off between model size and inference latency?"
    },
    {
        "id": "scenario-client-demo",
        "title": "Tech Demo To Enterprise Clients",
        "badge": "Thuyết Trình Khách Hàng",
        "ai_role": "Marcus - VP of Technology (Client)",
        "icon": "🤝",
        "description": "Trình bày giải pháp công nghệ, giải đáp các thắc mắc về tính bảo mật và khả năng chịu tải mở rộng (scalability).",
        "opening_line": "Hello! We've reviewed your preliminary deck and we're very interested. Could you walk me through how your system handles sudden spikes in data throughput?"
    }
]

@app.get("/api/roleplay/scenarios")
async def get_roleplay_scenarios():
    """Lấy danh sách các kịch bản đàm thoại nhập vai chuyên ngành Tech & AI."""
    return ROLEPLAY_SCENARIOS

@app.post("/api/roleplay/chat")
async def post_roleplay_chat(req: RoleplayChatRequest):
    """Gửi lượt nói của người học và nhận phản hồi tức thì từ nhân vật AI."""
    if not req.user_input.strip():
        raise HTTPException(status_code=400, detail="Nội dung nói không được để trống")
    res = await generate_roleplay_chat(
        scenario_id=req.scenario_id,
        messages=req.messages,
        user_input=req.user_input,
        custom_api_key=req.custom_api_key
    )
    return {"success": True, "reply": res["content"]}

@app.post("/api/roleplay/debrief")
async def post_roleplay_debrief(req: RoleplayDebriefRequest):
    """Tạo báo cáo đánh giá mổ xẻ sau khi kết thúc buổi hội thoại (Fluency, Grammar, Native Upgrades)."""
    return await generate_roleplay_debrief(
        scenario_id=req.scenario_id,
        messages=req.messages,
        custom_api_key=req.custom_api_key
    )

@app.post("/api/story/generate")
async def post_story_generate(req: StoryGenerateRequest):
    """Sáng tác mẩu chuyện công sở Tech kịch tính lồng ghép các từ vựng SRS cần ôn."""
    return await generate_vocabulary_story(
        words=req.words,
        theme=req.theme,
        custom_api_key=req.custom_api_key
    )

@app.post("/api/pronunciation/evaluate")
async def post_pronunciation_evaluate(req: PronunciationEvalRequest):
    """Chấm điểm phát âm từng từ, phát hiện nuốt âm đuôi và so khớp với câu mẫu."""
    return evaluate_pronunciation_diff(
        target_sentence=req.target_sentence,
        spoken_text=req.spoken_text
    )

@app.post("/api/assistant/ask")
async def post_assistant_ask(req: AssistantAskRequest):
    """Gia sư AI ảo giải thích ngữ pháp, từ vựng và câu hỏi tiếng Anh tại chỗ."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Câu hỏi không được để trống")
    return await ask_instant_assistant(
        question=req.question,
        selected_text=req.selected_text,
        context=req.context,
        custom_api_key=req.custom_api_key
    )



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
