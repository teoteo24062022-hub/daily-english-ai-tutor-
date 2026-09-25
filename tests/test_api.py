import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.gemini import clean_json_response

@pytest.mark.anyio
async def test_serve_frontend():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/")
        assert res.status_code == 200
        assert "Daily English AI Tutor" in res.text

@pytest.mark.anyio
async def test_config_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/config")
        assert res.status_code == 200
        data = res.json()
        assert "has_api_key" in data
        assert "active_model" in data

        post_res = await ac.post("/api/config", json={"api_key": "custom_test_key_xyz"})
        assert post_res.status_code == 200
        assert post_res.json()["success"] is True

        # Check has_api_key is now True
        res_after = await ac.get("/api/config")
        assert res_after.json()["has_api_key"] is True


@pytest.mark.anyio
async def test_topics_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/topics")
        assert res.status_code == 200
        topics = res.json()
        assert len(topics) == 20
        
        tech_topics = [t for t in topics if t["category"] == "tech"]
        assert len(tech_topics) == 5
        assert any(t["id"] == "ai-standup" for t in tech_topics)
        assert any(t["id"] == "ai-models" for t in tech_topics)
        assert any(t["id"] == "ai-debugging" for t in tech_topics)
        assert any(t["id"] == "ai-code-review" for t in tech_topics)
        assert any(t["id"] == "ai-meetings" for t in tech_topics)

        for t in topics:
            assert len(t["sentences"]) >= 5


@pytest.mark.anyio
async def test_progress_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/progress")
        assert res.status_code == 200
        data = res.json()
        assert "streak" in data
        assert "mistakes" in data

        post_payload = {
            "date": "2026-09-26",
            "completed_increment": 1,
            "score": 70,
            "mistake_item": {
                "id": "mistake-101",
                "topic_id": "ai-standup",
                "vietnamese": "Tôi đang sửa lỗi CUDA out of memory.",
                "user_english": "I fix CUDA memory bug.",
                "corrected_sentence": "I am fixing the CUDA out-of-memory error.",
                "explanation": "Dùng thì hiện tại tiếp diễn.",
                "timestamp": "2026-09-26T02:00:00"
            }
        }
        post_res = await ac.post("/api/progress", json=post_payload)
        assert post_res.status_code == 200
        progress = post_res.json()["progress"]
        assert progress["total_completed"] >= 1
        assert any(m["id"] == "mistake-101" for m in progress["mistakes"])


@pytest.mark.anyio
async def test_evaluate_fallback():
    # When no API key is provided, evaluate endpoint should return fallback gracefully
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req = {
            "topic_id": "greetings",
            "vietnamese": "Chào buổi sáng!",
            "user_english": "Good morning!",
            "is_voice": False,
            "custom_api_key": ""
        }
        res = await ac.post("/api/evaluate", json=req)
        assert res.status_code == 200
        eval_data = res.json()
        assert "score" in eval_data
        assert "corrected_sentence" in eval_data
        assert "encouragement" in eval_data


def test_clean_json_response():
    # Markdown wrapped json
    wrapped = "```json\n{\"score\": 95, \"is_correct\": true}\n```"
    result = clean_json_response(wrapped)
    assert result["score"] == 95
    assert result["is_correct"] is True

    # Raw string with surrounding text
    surrounded = "Here is the response:\n{\"score\": 88, \"is_correct\": true}\nHope this helps!"
    result2 = clean_json_response(surrounded)
    assert result2["score"] == 88
