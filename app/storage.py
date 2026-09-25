import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.models import Topic, Sentence, ProgressRecord, MistakeItem

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
TOPICS_FILE = DATA_DIR / "topics.json"
PROGRESS_FILE = DATA_DIR / "progress.json"
VOCABULARY_FILE = DATA_DIR / "vocabulary.json"
ROADMAP_FILE = DATA_DIR / "roadmap.json"

def ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

def get_user_dir(user_id: Optional[str]) -> Optional[Path]:
    if not user_id or user_id == "guest":
        return None
    user_dir = DATA_DIR / "users_data" / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir

def get_progress_file(user_id: Optional[str]) -> Path:
    user_dir = get_user_dir(user_id)
    if user_dir:
        return user_dir / "progress.json"
    return PROGRESS_FILE

def get_roadmap_file(user_id: Optional[str]) -> Path:
    user_dir = get_user_dir(user_id)
    if user_dir:
        return user_dir / "roadmap.json"
    return ROADMAP_FILE

def get_srs_file(user_id: Optional[str]) -> Optional[Path]:
    user_dir = get_user_dir(user_id)
    if user_dir:
        return user_dir / "srs_reviews.json"
    return None

def load_topics() -> List[Dict[str, Any]]:
    ensure_data_dir()
    if not TOPICS_FILE.exists():
        return []
    with open(TOPICS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def add_sentences_to_topic(topic_id: str, new_sentences: List[Dict[str, Any]]) -> bool:
    topics = load_topics()
    for topic in topics:
        if topic["id"] == topic_id:
            existing_ids = {s.get("id") for s in topic.get("sentences", [])}
            for s in new_sentences:
                if s.get("id") not in existing_ids:
                    topic["sentences"].append(s)
            with open(TOPICS_FILE, "w", encoding="utf-8") as f:
                json.dump(topics, f, ensure_ascii=False, indent=2)
            return True
    return False

def save_new_topic(new_topic: Dict[str, Any]) -> bool:
    topics = load_topics()
    # Check if id already exists
    if any(t["id"] == new_topic.get("id") for t in topics):
        new_topic["id"] = f"{new_topic.get('id', 'topic')}-{int(datetime.now().timestamp())}"
    topics.append(new_topic)
    with open(TOPICS_FILE, "w", encoding="utf-8") as f:
        json.dump(topics, f, ensure_ascii=False, indent=2)
    return True

def load_progress(user_id: Optional[str] = None) -> Dict[str, Any]:
    ensure_data_dir()
    prog_file = get_progress_file(user_id)
    default_progress = {
        "streak": 0,
        "last_date": None,
        "total_completed": 0,
        "today_completed": 0,
        "today_date": None,
        "mistakes": []
    }
    if not prog_file.exists():
        with open(prog_file, "w", encoding="utf-8") as f:
            json.dump(default_progress, f, ensure_ascii=False, indent=2)
        return default_progress
    try:
        with open(prog_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default_progress

def update_progress(
    date_str: str,
    completed_inc: int = 1,
    score: int = 100,
    mistake_item: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    prog_file = get_progress_file(user_id)
    prog = load_progress(user_id=user_id)
    today_dt = datetime.strptime(date_str, "%Y-%m-%d").date()
    
    last_date_str = prog.get("today_date")
    if last_date_str:
        last_dt = datetime.strptime(last_date_str, "%Y-%m-%d").date()
        diff_days = (today_dt - last_dt).days
        if diff_days == 0:
            # Same day
            prog["today_completed"] = prog.get("today_completed", 0) + completed_inc
        elif diff_days == 1:
            # Next consecutive day
            prog["streak"] = prog.get("streak", 0) + 1
            prog["today_completed"] = completed_inc
            prog["today_date"] = date_str
        elif diff_days > 1:
            # Missed a day -> reset streak to 1
            prog["streak"] = 1
            prog["today_completed"] = completed_inc
            prog["today_date"] = date_str
    else:
        # First day ever
        prog["streak"] = 1
        prog["today_completed"] = completed_inc
        prog["today_date"] = date_str
    
    prog["total_completed"] = prog.get("total_completed", 0) + completed_inc

    # Handle mistakes notebook
    if mistake_item:
        existing_mistakes = prog.get("mistakes", [])
        already_present = any(m.get("vietnamese") == mistake_item.get("vietnamese") for m in existing_mistakes)
        if not already_present:
            existing_mistakes.insert(0, mistake_item)
            prog["mistakes"] = existing_mistakes[:200]

    with open(prog_file, "w", encoding="utf-8") as f:
        json.dump(prog, f, ensure_ascii=False, indent=2)
    return prog

def _load_user_srs_data(user_id: str) -> Dict[str, Any]:
    srs_file = get_srs_file(user_id)
    if not srs_file or not srs_file.exists():
        return {"reviews": {}, "custom_items": []}
    try:
        with open(srs_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict):
                return {"reviews": {}, "custom_items": []}
            return data
    except Exception:
        return {"reviews": {}, "custom_items": []}

def _save_user_srs_data(user_id: str, data: Dict[str, Any]) -> None:
    srs_file = get_srs_file(user_id)
    if srs_file:
        with open(srs_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

def load_vocabulary(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    ensure_data_dir()
    base_items: List[Dict[str, Any]] = []
    if VOCABULARY_FILE.exists():
        try:
            with open(VOCABULARY_FILE, "r", encoding="utf-8") as f:
                base_items = json.load(f)
        except Exception:
            base_items = []

    if not user_id or user_id == "guest":
        return base_items

    # Deep copy base items so modifications are isolated
    user_srs = _load_user_srs_data(user_id)
    user_reviews = user_srs.get("reviews", {})
    custom_items = user_srs.get("custom_items", [])

    merged_items: List[Dict[str, Any]] = []
    # Add custom items first
    for ci in custom_items:
        ci_copy = dict(ci)
        if ci_copy.get("id") in user_reviews:
            ci_copy.update(user_reviews[ci_copy["id"]])
        merged_items.append(ci_copy)

    # Add base items with user review overrides
    for bi in base_items:
        bi_copy = dict(bi)
        if bi_copy.get("id") in user_reviews:
            bi_copy.update(user_reviews[bi_copy["id"]])
        merged_items.append(bi_copy)

    return merged_items

def save_vocabulary(items: List[Dict[str, Any]]) -> bool:
    ensure_data_dir()
    with open(VOCABULARY_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    return True

def update_vocab_review(vocab_id: str, grade: int, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    SRS (Spaced Repetition System) calculation:
    grade:
      0 = Again (Chưa nhớ -> Ôn lại ngay trong ngày / sau 0 ngày)
      1 = Hard (Khó -> Ôn lại sau 1 ngày)
      2 = Good (Tốt -> Ôn lại sau 3 * stage ngày)
      3 = Easy (Dễ/Thuộc -> Ôn lại sau 7 * stage ngày)
    """
    items = load_vocabulary(user_id=user_id)
    target_item = None
    today = datetime.now().date()

    for item in items:
        if item.get("id") == vocab_id:
            stage = item.get("srs_stage", 1)
            review_count = item.get("review_count", 0) + 1
            item["review_count"] = review_count

            if grade == 0:
                new_stage = 1
                days_add = 0
            elif grade == 1:
                new_stage = max(1, stage)
                days_add = 1
            elif grade == 2:
                new_stage = stage + 1
                days_add = max(2, stage * 3)
            elif grade == 3:
                new_stage = stage + 2
                days_add = max(4, stage * 7)
            else:
                new_stage = stage
                days_add = 1

            next_date = today + timedelta(days=days_add)
            item["srs_stage"] = new_stage
            item["next_review"] = next_date.strftime("%Y-%m-%d")
            target_item = item
            break

    if target_item:
        if user_id and user_id != "guest":
            user_srs = _load_user_srs_data(user_id)
            if "reviews" not in user_srs:
                user_srs["reviews"] = {}
            user_srs["reviews"][vocab_id] = {
                "srs_stage": target_item["srs_stage"],
                "review_count": target_item["review_count"],
                "next_review": target_item["next_review"],
                "last_grade": grade,
                "updated_at": datetime.now().isoformat()
            }
            _save_user_srs_data(user_id, user_srs)
        else:
            save_vocabulary(items)

    return target_item

def add_vocab_item(item: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    if not item.get("id"):
        item["id"] = f"v-{int(datetime.now().timestamp())}"
    if not item.get("next_review"):
        item["next_review"] = datetime.now().strftime("%Y-%m-%d")
    if "srs_stage" not in item:
        item["srs_stage"] = 1
    if "review_count" not in item:
        item["review_count"] = 0

    if user_id and user_id != "guest":
        user_srs = _load_user_srs_data(user_id)
        if "custom_items" not in user_srs:
            user_srs["custom_items"] = []
        # Check if already exists in custom items
        existing = next((x for x in user_srs["custom_items"] if x.get("word", "").lower() == item.get("word", "").lower()), None)
        if existing:
            existing.update(item)
        else:
            user_srs["custom_items"].insert(0, item)
        _save_user_srs_data(user_id, user_srs)
        return item

    items = load_vocabulary()
    existing = next((x for x in items if x.get("word", "").lower() == item.get("word", "").lower()), None)
    if existing:
        existing.update(item)
    else:
        items.insert(0, item)
    save_vocabulary(items)
    return item

def load_roadmap(user_id: Optional[str] = None) -> Dict[str, Any]:
    ensure_data_dir()
    base_data = {"current_day": 1, "completed_days": [], "phases": [], "days": []}
    if ROADMAP_FILE.exists():
        try:
            with open(ROADMAP_FILE, "r", encoding="utf-8") as f:
                base_data = json.load(f)
        except Exception:
            pass

    if not user_id or user_id == "guest":
        return base_data

    user_file = get_roadmap_file(user_id)
    if user_file.exists():
        try:
            with open(user_file, "r", encoding="utf-8") as f:
                user_data = json.load(f)
                return {
                    "phases": base_data.get("phases", []),
                    "days": base_data.get("days", []),
                    "current_day": user_data.get("current_day", 1),
                    "completed_days": user_data.get("completed_days", [])
                }
        except Exception:
            pass

    return {
        "phases": base_data.get("phases", []),
        "days": base_data.get("days", []),
        "current_day": 1,
        "completed_days": []
    }

def update_roadmap_progress(day: int, completed: bool = True, user_id: Optional[str] = None) -> Dict[str, Any]:
    if user_id and user_id != "guest":
        user_file = get_roadmap_file(user_id)
        current_data = {"current_day": 1, "completed_days": []}
        if user_file.exists():
            try:
                with open(user_file, "r", encoding="utf-8") as f:
                    current_data = json.load(f)
            except Exception:
                pass

        completed_days = set(current_data.get("completed_days", []))
        if completed:
            completed_days.add(day)
            if day >= current_data.get("current_day", 1):
                current_data["current_day"] = min(90, day + 1)
        else:
            completed_days.discard(day)

        current_data["completed_days"] = sorted(list(completed_days))
        with open(user_file, "w", encoding="utf-8") as f:
            json.dump(current_data, f, ensure_ascii=False, indent=2)

        return load_roadmap(user_id=user_id)

    roadmap = load_roadmap()
    completed_days = set(roadmap.get("completed_days", []))
    if completed:
        completed_days.add(day)
        if day >= roadmap.get("current_day", 1):
            roadmap["current_day"] = min(90, day + 1)
    else:
        completed_days.discard(day)

    roadmap["completed_days"] = sorted(list(completed_days))
    with open(ROADMAP_FILE, "w", encoding="utf-8") as f:
        json.dump(roadmap, f, ensure_ascii=False, indent=2)
    return roadmap

def merge_guest_data_into_user(user_id: str) -> None:
    """
    Transfers progress, mistakes, and roadmap from guest to a newly authenticated user.
    """
    if not user_id or user_id == "guest":
        return
    guest_prog = load_progress(user_id=None)
    user_prog = load_progress(user_id=user_id)

    if guest_prog.get("total_completed", 0) > 0:
        user_prog["total_completed"] = max(user_prog.get("total_completed", 0), guest_prog.get("total_completed", 0))
        user_prog["today_completed"] = max(user_prog.get("today_completed", 0), guest_prog.get("today_completed", 0))
        user_prog["streak"] = max(user_prog.get("streak", 1), guest_prog.get("streak", 1))
        user_prog["today_date"] = guest_prog.get("today_date") or user_prog.get("today_date")

        guest_mistakes = guest_prog.get("mistakes", [])
        user_mistakes = user_prog.get("mistakes", [])
        existing_vi = {m.get("vietnamese") for m in user_mistakes}
        for gm in guest_mistakes:
            if gm.get("vietnamese") not in existing_vi:
                user_mistakes.append(gm)
        user_prog["mistakes"] = user_mistakes[:200]
        user_prog_file = get_progress_file(user_id)
        with open(user_prog_file, "w", encoding="utf-8") as f:
            json.dump(user_prog, f, ensure_ascii=False, indent=2)

    guest_roadmap = load_roadmap(user_id=None)
    if guest_roadmap.get("completed_days"):
        user_roadmap_file = get_roadmap_file(user_id)
        current_data = {"current_day": 1, "completed_days": []}
        if user_roadmap_file.exists():
            try:
                with open(user_roadmap_file, "r", encoding="utf-8") as f:
                    current_data = json.load(f)
            except Exception:
                pass
        combined = set(current_data.get("completed_days", [])) | set(guest_roadmap.get("completed_days", []))
        current_data["completed_days"] = sorted(list(combined))
        current_data["current_day"] = max(current_data.get("current_day", 1), guest_roadmap.get("current_day", 1))
        with open(user_roadmap_file, "w", encoding="utf-8") as f:
            json.dump(current_data, f, ensure_ascii=False, indent=2)
