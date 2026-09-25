import pytest
from httpx import AsyncClient, ASGITransport
from main import app
import app.auth as auth_mod
import app.storage as storage_mod

@pytest.fixture(autouse=True)
def isolate_auth_storage(tmp_path, monkeypatch):
    test_data_dir = tmp_path / "data"
    test_data_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(auth_mod, "DATA_DIR", test_data_dir)
    monkeypatch.setattr(auth_mod, "USERS_FILE", test_data_dir / "users.json")
    monkeypatch.setattr(auth_mod, "SESSIONS_FILE", test_data_dir / "sessions.json")
    monkeypatch.setattr(storage_mod, "DATA_DIR", test_data_dir)
    monkeypatch.setattr(storage_mod, "PROGRESS_FILE", test_data_dir / "progress.json")
    monkeypatch.setattr(storage_mod, "ROADMAP_FILE", test_data_dir / "roadmap.json")
    monkeypatch.setattr(storage_mod, "VOCABULARY_FILE", test_data_dir / "vocabulary.json")

@pytest.mark.anyio
async def test_auth_api_register_and_me():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register new account
        reg_data = {
            "email": "test_api_user@example.com",
            "username": "APIUser1",
            "password": "Password123"
        }
        res = await ac.post("/api/auth/register", json=reg_data)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["token"] is not None
        assert data["recovery_pin"] is not None
        assert len(data["recovery_pin"]) == 6
        assert data["user"]["email"] == "test_api_user@example.com"
        assert data["user"]["username"] == "APIUser1"

        token = data["token"]

        # Call /api/auth/me with Bearer token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await ac.get("/api/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["authenticated"] is True
        assert me_data["user"]["email"] == "test_api_user@example.com"

@pytest.mark.anyio
async def test_auth_api_login_and_logout():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register first
        reg_data = {
            "email": "login_user@example.com",
            "username": "LoginTester",
            "password": "SecretPass123"
        }
        await ac.post("/api/auth/register", json=reg_data)

        # Login with email
        login_res = await ac.post("/api/auth/login", json={
            "email_or_username": "login_user@example.com",
            "password": "SecretPass123"
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["success"] is True
        assert login_data["token"] is not None

        token = login_data["token"]

        # Logout
        logout_res = await ac.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
        assert logout_res.status_code == 200
        assert logout_res.json()["success"] is True

        # Now /api/auth/me returns unauthenticated
        me_res = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.json()["authenticated"] is False

@pytest.mark.anyio
async def test_auth_api_forgot_password_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        reg_res = await ac.post("/api/auth/register", json={
            "email": "forgot_user@example.com",
            "username": "ForgotTester",
            "password": "OldPassword123"
        })
        pin = reg_res.json()["recovery_pin"]

        # Attempt reset with wrong PIN
        bad_reset = await ac.post("/api/auth/forgot-password", json={
            "email": "forgot_user@example.com",
            "recovery_pin": "000000" if pin != "000000" else "111111",
            "new_password": "NewBrandPassword456"
        })
        assert bad_reset.status_code == 400

        # Reset with correct PIN
        good_reset = await ac.post("/api/auth/forgot-password", json={
            "email": "forgot_user@example.com",
            "recovery_pin": pin,
            "new_password": "NewBrandPassword456"
        })
        assert good_reset.status_code == 200
        assert good_reset.json()["success"] is True

        # Login with new password
        login_res = await ac.post("/api/auth/login", json={
            "email_or_username": "forgot_user@example.com",
            "password": "NewBrandPassword456"
        })
        assert login_res.status_code == 200
        assert login_res.json()["success"] is True

@pytest.mark.anyio
async def test_auth_api_per_user_progress_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create user
        reg = await ac.post("/api/auth/register", json={
            "email": "prog_user@example.com",
            "username": "ProgTester",
            "password": "Secret123456"
        })
        token = reg.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Update progress for this user
        prog_req = {
            "date": "2026-09-26",
            "completed_increment": 7,
            "score": 95,
            "mistake_item": None
        }
        post_res = await ac.post("/api/progress", json=prog_req, headers=headers)
        assert post_res.status_code == 200
        assert post_res.json()["progress"]["total_completed"] >= 7

        # Retrieve progress for this user
        get_res = await ac.get("/api/progress", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["total_completed"] >= 7
