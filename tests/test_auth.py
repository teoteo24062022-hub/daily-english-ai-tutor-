import pytest
from app.auth import (
    register_user,
    authenticate_user,
    reset_password_with_pin,
    get_user_by_token,
    revoke_token,
    hash_password,
    verify_password
)

def test_password_hashing():
    salt = "abcd1234cdef5678"
    pw = "SecretPass123"
    hashed = hash_password(pw, salt)
    assert verify_password(pw, salt, hashed) is True
    assert verify_password("WrongPass", salt, hashed) is False

def test_register_and_authenticate(tmp_path, monkeypatch):
    test_users_file = tmp_path / "users.json"
    test_sessions_file = tmp_path / "sessions.json"
    monkeypatch.setattr("app.auth.USERS_FILE", test_users_file)
    monkeypatch.setattr("app.auth.SESSIONS_FILE", test_sessions_file)

    # 1. Register valid user
    user, token, pin, err = register_user("learner@example.com", "AlexDev", "MySecret123")
    assert err is None
    assert user is not None
    assert user.email == "learner@example.com"
    assert user.username == "AlexDev"
    assert token is not None
    assert len(pin) == 6
    assert pin.isdigit()

    # 2. Duplicate email rejected
    u2, t2, p2, err2 = register_user("learner@example.com", "OtherName", "Pass123456")
    assert u2 is None
    assert "đã được đăng ký" in err2

    # 3. Duplicate username rejected
    u3, t3, p3, err3 = register_user("other@example.com", "alexdev", "Pass123456")
    assert u3 is None
    assert "đã có người sử dụng" in err3

    # 4. Authenticate with correct credentials (both email and username)
    auth_user, auth_tok, auth_err = authenticate_user("learner@example.com", "MySecret123")
    assert auth_err is None
    assert auth_user.id == user.id
    assert auth_tok is not None

    auth_user2, _, auth_err2 = authenticate_user("AlexDev", "MySecret123")
    assert auth_err2 is None
    assert auth_user2.id == user.id

    # 5. Wrong password fails
    _, _, bad_pw_err = authenticate_user("learner@example.com", "WrongPassword")
    assert bad_pw_err is not None

def test_session_token_validation(tmp_path, monkeypatch):
    test_users_file = tmp_path / "users.json"
    test_sessions_file = tmp_path / "sessions.json"
    monkeypatch.setattr("app.auth.USERS_FILE", test_users_file)
    monkeypatch.setattr("app.auth.SESSIONS_FILE", test_sessions_file)

    user, token, pin, _ = register_user("session@test.com", "SessionUser", "Pass123")
    assert token is not None

    # Retrieve by token
    verified_user = get_user_by_token(token)
    assert verified_user is not None
    assert verified_user.id == user.id

    # Invalid token returns None
    assert get_user_by_token("nonexistent_token") is None
    assert get_user_by_token(None) is None

    # Revoke token
    assert revoke_token(token) is True
    assert get_user_by_token(token) is None

def test_reset_password_with_pin(tmp_path, monkeypatch):
    test_users_file = tmp_path / "users.json"
    test_sessions_file = tmp_path / "sessions.json"
    monkeypatch.setattr("app.auth.USERS_FILE", test_users_file)
    monkeypatch.setattr("app.auth.SESSIONS_FILE", test_sessions_file)

    user, token, pin, _ = register_user("pin_test@test.com", "PinUser", "InitialPass1")

    # Wrong PIN fails
    ok, msg = reset_password_with_pin("pin_test@test.com", "000000" if pin != "000000" else "111111", "NewPass123")
    assert ok is False
    assert "không chính xác" in msg

    # Correct PIN succeeds
    ok2, msg2 = reset_password_with_pin("pin_test@test.com", pin, "NewPass123")
    assert ok2 is True
    assert "thành công" in msg2

    # Can now login with new password
    auth_user, _, err = authenticate_user("pin_test@test.com", "NewPass123")
    assert err is None
    assert auth_user.id == user.id

    # Old password no longer works
    _, _, err_old = authenticate_user("pin_test@test.com", "InitialPass1")
    assert err_old is not None
