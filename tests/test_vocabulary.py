import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.anyio
async def test_get_vocabulary():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/vocabulary")
        assert res.status_code == 200
        vocab_list = res.json()
        assert isinstance(vocab_list, list)
        assert len(vocab_list) >= 10
        # Check first item has necessary fields
        first = vocab_list[0]
        assert "id" in first
        assert "word" in first
        assert "meaning" in first
        assert "srs_stage" in first
        assert "next_review" in first

@pytest.mark.anyio
async def test_vocabulary_review_srs():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get list first
        list_res = await ac.get("/api/vocabulary")
        vocab = list_res.json()[0]
        vocab_id = vocab["id"]

        # Review with grade 2 (Good)
        req = {
            "vocab_id": vocab_id,
            "grade": 2
        }
        res = await ac.post("/api/vocabulary/review", json=req)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        updated = data["item"]
        assert updated["id"] == vocab_id
        assert updated["review_count"] >= 1
        assert updated["srs_stage"] >= 2

@pytest.mark.anyio
async def test_vocabulary_ai_generate_and_add():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # AI generate with fallback (no key needed)
        gen_req = {
            "word": "inference",
            "context_hint": "Machine Learning and AI",
            "custom_api_key": ""
        }
        gen_res = await ac.post("/api/vocabulary/ai-generate", json=gen_req)
        assert gen_res.status_code == 200
        gen_data = gen_res.json()
        assert "word" in gen_data
        assert "meaning" in gen_data
        assert "example_en" in gen_data

        # Add custom word
        add_req = {
            "word": gen_data["word"],
            "ipa": gen_data.get("ipa", "/ˈɪn.fɚ.əns/"),
            "part_of_speech": gen_data.get("part_of_speech", "noun"),
            "level": "A2-AI",
            "meaning": gen_data["meaning"],
            "example_en": gen_data["example_en"],
            "example_vi": gen_data.get("example_vi", "Ví dụ tiếng Việt"),
            "mnemonic": gen_data.get("mnemonic", "Mẹo ghi nhớ")
        }
        add_res = await ac.post("/api/vocabulary/add", json=add_req)
        assert add_res.status_code == 200
        assert add_res.json()["success"] is True
        saved = add_res.json()["item"]
        assert saved["word"] == "inference"

@pytest.mark.anyio
async def test_4000_vocabulary_coverage():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/vocabulary")
        assert res.status_code == 200
        vocab_list = res.json()
        assert len(vocab_list) >= 4000
        
        levels = set(v.get("level", "") for v in vocab_list)
        # Verify coverage across all required CEFR stages
        assert "A1" in levels
        assert "A2" in levels
        assert "B1" in levels
        assert "B2" in levels
        assert any("tech" in l.lower() or "ai" in l.lower() for l in levels)

        # Check sample words from different levels
        a1_words = [v for v in vocab_list if v.get("level") == "A1"]
        b2_words = [v for v in vocab_list if "B2" in v.get("level", "")]
        assert len(a1_words) >= 1000
        assert len(b2_words) >= 1000

