import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.models import Topic, Sentence, ProgressRecord, MistakeItem

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
TOPICS_FILE = DATA_DIR / "topics.json"
PROGRESS_FILE = DATA_DIR / "progress.json"

def ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

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

def load_progress() -> Dict[str, Any]:
    ensure_data_dir()
    default_progress = {
        "streak": 0,
        "last_date": None,
        "total_completed": 0,
        "today_completed": 0,
        "today_date": None,
        "mistakes": []
    }
    if not PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(default_progress, f, ensure_ascii=False, indent=2)
        return default_progress
    try:
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default_progress

def update_progress(
    date_str: str,
    completed_inc: int = 1,
    score: int = 100,
    mistake_item: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    prog = load_progress()
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
        # Check if already in mistakes
        already_present = any(m.get("vietnamese") == mistake_item.get("vietnamese") for m in existing_mistakes)
        if not already_present:
            existing_mistakes.insert(0, mistake_item)
            # Keep up to 200 most recent mistakes
            prog["mistakes"] = existing_mistakes[:200]

    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(prog, f, ensure_ascii=False, indent=2)
    return prog
