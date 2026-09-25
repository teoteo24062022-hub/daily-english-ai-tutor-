import json
import secrets
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any, List
from app.models import UserRecord, UserPublic, AuthSession

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
USERS_FILE = DATA_DIR / "users.json"
SESSIONS_FILE = DATA_DIR / "sessions.json"

def ensure_auth_files() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not USERS_FILE.exists():
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)
    if not SESSIONS_FILE.exists():
        with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f, ensure_ascii=False, indent=2)

def hash_password(password: str, salt_hex: str) -> str:
    salt_bytes = bytes.fromhex(salt_hex)
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 100_000).hex()

def verify_password(password: str, salt_hex: str, expected_hash: str) -> bool:
    computed_hash = hash_password(password, salt_hex)
    return secrets.compare_digest(computed_hash, expected_hash)

def generate_recovery_pin() -> str:
    # 6-digit pin from 100000 to 999999
    return f"{secrets.randbelow(900000) + 100000}"

def hash_pin(pin: str, salt_hex: str) -> str:
    return hashlib.sha256((pin + salt_hex).encode("utf-8")).hexdigest()

def verify_pin(pin: str, salt_hex: str, expected_hash: str) -> bool:
    computed = hash_pin(pin, salt_hex)
    return secrets.compare_digest(computed, expected_hash)

def load_users() -> List[Dict[str, Any]]:
    ensure_auth_files()
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_users(users: List[Dict[str, Any]]) -> None:
    ensure_auth_files()
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def load_sessions() -> Dict[str, Dict[str, Any]]:
    ensure_auth_files()
    try:
        with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_sessions(sessions: Dict[str, Dict[str, Any]]) -> None:
    ensure_auth_files()
    with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(sessions, f, ensure_ascii=False, indent=2)

def create_session(user_id: str, days: int = 30) -> str:
    token = secrets.token_hex(32)
    sessions = load_sessions()
    now = datetime.now()
    expires = now + timedelta(days=days)
    
    sessions[token] = {
        "token": token,
        "user_id": user_id,
        "created_at": now.isoformat(),
        "expires_at": expires.isoformat()
    }
    save_sessions(sessions)
    return token

def get_user_by_token(token: Optional[str]) -> Optional[UserRecord]:
    if not token:
        return None
    sessions = load_sessions()
    sess = sessions.get(token)
    if not sess:
        return None
    
    # Check expiry
    try:
        expires_at = datetime.fromisoformat(sess["expires_at"])
        if datetime.now() > expires_at:
            # expired, clean up
            del sessions[token]
            save_sessions(sessions)
            return None
    except Exception:
        return None
        
    user_id = sess.get("user_id")
    users = load_users()
    for u in users:
        if u.get("id") == user_id:
            return UserRecord(**u)
    return None

def revoke_token(token: str) -> bool:
    sessions = load_sessions()
    if token in sessions:
        del sessions[token]
        save_sessions(sessions)
        return True
    return False

def register_user(email: str, username: str, password: str) -> Tuple[Optional[UserRecord], Optional[str], Optional[str], Optional[str]]:
    """
    Registers a new user.
    Returns: (user_record, session_token, recovery_pin, error_message)
    """
    email_clean = email.strip().lower()
    username_clean = username.strip()
    
    if not email_clean or "@" not in email_clean:
        return None, None, None, "Email không hợp lệ."
    if len(username_clean) < 2:
        return None, None, None, "Tên hiển thị phải có ít nhất 2 ký tự."
    if len(password) < 6:
        return None, None, None, "Mật khẩu phải có ít nhất 6 ký tự."
        
    users = load_users()
    for u in users:
        if u.get("email", "").lower() == email_clean:
            return None, None, None, "Email này đã được đăng ký tài khoản."
        if u.get("username", "").lower() == username_clean.lower():
            return None, None, None, "Tên hiển thị này đã có người sử dụng."
            
    salt = secrets.token_hex(16)
    pw_hash = hash_password(password, salt)
    pin = generate_recovery_pin()
    pin_hash = hash_pin(pin, salt)
    
    user_id = f"usr_{int(datetime.now().timestamp())}_{secrets.token_hex(4)}"
    new_user = {
        "id": user_id,
        "email": email_clean,
        "username": username_clean,
        "password_hash": pw_hash,
        "salt": salt,
        "recovery_pin_hash": pin_hash,
        "created_at": datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_users(users)
    
    token = create_session(user_id)
    return UserRecord(**new_user), token, pin, None

def authenticate_user(email_or_username: str, password: str) -> Tuple[Optional[UserRecord], Optional[str], Optional[str]]:
    """
    Authenticates user by email or username.
    Returns: (user_record, session_token, error_message)
    """
    query = email_or_username.strip().lower()
    if not query or not password:
        return None, None, "Vui lòng nhập đầy đủ thông tin đăng nhập."
        
    users = load_users()
    matched_user = None
    for u in users:
        if u.get("email", "").lower() == query or u.get("username", "").lower() == query:
            matched_user = u
            break
            
    if not matched_user:
        return None, None, "Tài khoản hoặc mật khẩu không chính xác."
        
    if not verify_password(password, matched_user["salt"], matched_user["password_hash"]):
        return None, None, "Tài khoản hoặc mật khẩu không chính xác."
        
    token = create_session(matched_user["id"])
    return UserRecord(**matched_user), token, None

def reset_password_with_pin(email: str, recovery_pin: str, new_password: str) -> Tuple[bool, str]:
    """
    Resets password using 6-digit recovery PIN.
    Returns: (success, message)
    """
    email_clean = email.strip().lower()
    pin_clean = recovery_pin.strip()
    if not email_clean or not pin_clean:
        return False, "Vui lòng nhập Email và Mã PIN khôi phục."
    if len(new_password) < 6:
        return False, "Mật khẩu mới phải có ít nhất 6 ký tự."
        
    users = load_users()
    matched_user = None
    for u in users:
        if u.get("email", "").lower() == email_clean:
            matched_user = u
            break
            
    if not matched_user:
        return False, "Không tìm thấy tài khoản với email này."
        
    if not verify_pin(pin_clean, matched_user["salt"], matched_user["recovery_pin_hash"]):
        return False, "Mã PIN khôi phục không chính xác."
        
    # Update password
    new_salt = secrets.token_hex(16)
    new_pw_hash = hash_password(new_password, new_salt)
    # regenerate a new pin or keep old pin hashed with new salt
    new_pin_hash = hash_pin(pin_clean, new_salt)
    
    matched_user["salt"] = new_salt
    matched_user["password_hash"] = new_pw_hash
    matched_user["recovery_pin_hash"] = new_pin_hash
    save_users(users)
    
    return True, "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay."
