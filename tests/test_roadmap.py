import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.anyio
async def test_get_roadmap():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/roadmap")
        assert res.status_code == 200
        data = res.json()
        assert "phases" in data
        assert len(data["phases"]) == 3
        assert "days" in data
        assert len(data["days"]) >= 10
        assert "current_day" in data

@pytest.mark.anyio
async def test_complete_roadmap_day():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req = {"day": 1}
        res = await ac.post("/api/roadmap/complete-day", json=req)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        roadmap = data["roadmap"]
        assert 1 in roadmap["completed_days"]
        assert roadmap["current_day"] >= 2
