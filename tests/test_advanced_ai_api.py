import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.anyio
async def test_get_roleplay_scenarios():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/roleplay/scenarios")
        assert res.status_code == 200
        scenarios = res.json()
        assert isinstance(scenarios, list)
        assert len(scenarios) >= 5
        first = scenarios[0]
        assert "id" in first
        assert "title" in first
        assert "ai_role" in first
        assert "opening_line" in first

@pytest.mark.anyio
async def test_post_roleplay_chat():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req = {
            "scenario_id": "scenario-tech-interview",
            "messages": [{"role": "ai", "content": "Welcome to the interview."}],
            "user_input": "I have experience with Python and machine learning.",
            "custom_api_key": ""
        }
        res = await ac.post("/api/roleplay/chat", json=req)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "reply" in data
        assert len(data["reply"]) > 5

@pytest.mark.anyio
async def test_post_roleplay_debrief():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req = {
            "scenario_id": "scenario-tech-interview",
            "messages": [
                {"role": "ai", "content": "Welcome to the interview."},
                {"role": "user", "content": "I worked on NLP models and trade-offs."}
            ],
            "custom_api_key": ""
        }
        res = await ac.post("/api/roleplay/debrief", json=req)
        assert res.status_code == 200
        data = res.json()
        assert "overall_score" in data
        assert "fluency_level" in data
        assert "grammar_corrections" in data

@pytest.mark.anyio
async def test_post_story_generate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req = {
            "words": ["bottleneck", "scalability", "latency"],
            "theme": "tech_work",
            "custom_api_key": ""
        }
        res = await ac.post("/api/story/generate", json=req)
        assert res.status_code == 200
        data = res.json()
        assert "title_en" in data
        assert "content_en" in data
        assert "content_vi" in data
        assert "quiz" in data

@pytest.mark.anyio
async def test_post_pronunciation_evaluate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req = {
            "target_sentence": "She works on deep learning models.",
            "spoken_text": "She work on deep learning model"
        }
        res = await ac.post("/api/pronunciation/evaluate", json=req)
        assert res.status_code == 200
        data = res.json()
        assert "overall_score" in data
        assert "words" in data
        assert len(data["words"]) > 0

@pytest.mark.anyio
async def test_post_assistant_ask():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req = {
            "question": "Giải thích cấu trúc 'in terms of'?",
            "selected_text": "in terms of",
            "context": "Daily standup",
            "custom_api_key": ""
        }
        res = await ac.post("/api/assistant/ask", json=req)
        assert res.status_code == 200
        data = res.json()
        assert "answer_vi" in data
        assert "examples" in data
