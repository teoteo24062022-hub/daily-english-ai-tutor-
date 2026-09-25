import pytest
from app.storage import (
    load_progress,
    update_progress,
    load_roadmap,
    update_roadmap_progress,
    load_vocabulary,
    update_vocab_review,
    add_vocab_item
)

def test_user_progress_isolation(tmp_path, monkeypatch):
    test_data_dir = tmp_path / "data"
    test_data_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr("app.storage.DATA_DIR", test_data_dir)
    monkeypatch.setattr("app.storage.PROGRESS_FILE", test_data_dir / "progress.json")

    user_a = "usr_alice"
    user_b = "usr_bob"

    # User A does 5 exercises and makes a mistake
    mistake_a = {
        "topic": "Daily",
        "vietnamese": "Tôi đi làm",
        "correct_english": "I go to work",
        "user_english": "I goes to work",
        "feedback": "Use 'go' with 'I'"
    }
    update_progress("2026-09-26", completed_inc=5, score=80, mistake_item=mistake_a, user_id=user_a)

    # User B does 2 exercises and has no mistakes
    update_progress("2026-09-26", completed_inc=2, score=100, mistake_item=None, user_id=user_b)

    # Check Alice
    prog_a = load_progress(user_id=user_a)
    assert prog_a["total_completed"] == 5
    assert prog_a["today_completed"] == 5
    assert len(prog_a["mistakes"]) == 1
    assert prog_a["mistakes"][0]["user_english"] == "I goes to work"

    # Check Bob
    prog_b = load_progress(user_id=user_b)
    assert prog_b["total_completed"] == 2
    assert prog_b["today_completed"] == 2
    assert len(prog_b["mistakes"]) == 0

def test_user_roadmap_isolation(tmp_path, monkeypatch):
    test_data_dir = tmp_path / "data"
    test_data_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr("app.storage.DATA_DIR", test_data_dir)
    monkeypatch.setattr("app.storage.ROADMAP_FILE", test_data_dir / "roadmap.json")

    # Seed base roadmap
    import json
    base_roadmap = {
        "phases": [{"id": 1, "title": "Phase 1"}],
        "days": [{"day": 1, "title": "Day 1"}, {"day": 2, "title": "Day 2"}, {"day": 3, "title": "Day 3"}],
        "current_day": 1,
        "completed_days": []
    }
    with open(test_data_dir / "roadmap.json", "w", encoding="utf-8") as f:
        json.dump(base_roadmap, f)

    user_a = "usr_alice"
    user_b = "usr_bob"

    # Alice completes Day 1
    update_roadmap_progress(1, completed=True, user_id=user_a)

    roadmap_a = load_roadmap(user_id=user_a)
    assert 1 in roadmap_a["completed_days"]
    assert roadmap_a["current_day"] == 2

    # Bob should still be at Day 1 with 0 completed days
    roadmap_b = load_roadmap(user_id=user_b)
    assert len(roadmap_b["completed_days"]) == 0
    assert roadmap_b["current_day"] == 1

def test_user_vocab_srs_isolation(tmp_path, monkeypatch):
    test_data_dir = tmp_path / "data"
    test_data_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr("app.storage.DATA_DIR", test_data_dir)
    monkeypatch.setattr("app.storage.VOCABULARY_FILE", test_data_dir / "vocabulary.json")

    import json
    base_vocab = [
        {
            "id": "v-deploy",
            "word": "deploy",
            "meaning": "triển khai",
            "srs_stage": 1,
            "review_count": 0,
            "next_review": "2026-09-26"
        }
    ]
    with open(test_data_dir / "vocabulary.json", "w", encoding="utf-8") as f:
        json.dump(base_vocab, f)

    user_a = "usr_alice"
    user_b = "usr_bob"

    # Alice reviews with grade 3 (Easy -> srs_stage should advance to 3)
    updated_a = update_vocab_review("v-deploy", grade=3, user_id=user_a)
    assert updated_a is not None
    assert updated_a["srs_stage"] == 3
    assert updated_a["review_count"] == 1

    # Bob reviews with grade 0 (Again -> srs_stage reset to 1)
    updated_b = update_vocab_review("v-deploy", grade=0, user_id=user_b)
    assert updated_b is not None
    assert updated_b["srs_stage"] == 1

    # Verify when loading vocabulary for both users
    v_list_a = load_vocabulary(user_id=user_a)
    item_a = next(v for v in v_list_a if v["id"] == "v-deploy")
    assert item_a["srs_stage"] == 3

    v_list_b = load_vocabulary(user_id=user_b)
    item_b = next(v for v in v_list_b if v["id"] == "v-deploy")
    assert item_b["srs_stage"] == 1
