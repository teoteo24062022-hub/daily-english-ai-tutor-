import pytest
from app.models import (
    RoleplayMessage, RoleplayChatRequest, RoleplayDebriefRequest, RoleplayDebriefResponse,
    StoryGenerateRequest, StoryGenerateResponse, StoryQuizQuestion,
    PronunciationEvalRequest, PronunciationEvalResponse, WordScore,
    AssistantAskRequest, AssistantAskResponse
)
from app.gemini import (
    generate_roleplay_chat, generate_roleplay_debrief,
    generate_vocabulary_story, evaluate_pronunciation_diff,
    ask_instant_assistant
)

@pytest.mark.anyio
async def test_roleplay_chat_handler_fallback():
    scenario_id = "scenario-tech-interview"
    messages = [RoleplayMessage(role="ai", content="Hello! Welcome to the interview.")]
    user_input = "Hi, I have 3 years of experience in deep learning and NLP."
    res = await generate_roleplay_chat(scenario_id, messages, user_input, custom_api_key="")
    assert "role" in res
    assert res["role"] == "ai"
    assert "content" in res
    assert len(res["content"]) > 10

@pytest.mark.anyio
async def test_roleplay_debrief_handler_fallback():
    scenario_id = "scenario-tech-interview"
    messages = [
        RoleplayMessage(role="ai", content="Hello! Tell me about your experience."),
        RoleplayMessage(role="user", content="I worked on LLM latency and fine-tune models.")
    ]
    res = await generate_roleplay_debrief(scenario_id, messages, custom_api_key="")
    # Validate with Pydantic model
    validated = RoleplayDebriefResponse(**res)
    assert validated.overall_score >= 0
    assert len(validated.grammar_corrections) >= 1
    assert len(validated.native_upgrades) >= 1

@pytest.mark.anyio
async def test_story_generator_handler_fallback():
    words = ["latency", "bottleneck", "scalability"]
    res = await generate_vocabulary_story(words, theme="tech_work", custom_api_key="")
    validated = StoryGenerateResponse(**res)
    assert "latency" in [w.lower() for w in validated.words_included] or len(validated.words_included) >= 1
    assert len(validated.content_en) > 20
    assert len(validated.content_vi) > 20
    assert len(validated.quiz) >= 1

@pytest.mark.anyio
async def test_pronunciation_diff_evaluator():
    target = "There is always a trade-off between model latency and inference accuracy."
    spoken = "There is always a trade between model latency and inference accuracy"
    res = evaluate_pronunciation_diff(target, spoken)
    validated = PronunciationEvalResponse(**res)
    assert 0 <= validated.overall_score <= 100
    assert len(validated.words) > 0
    # 'trade-off' vs 'trade' or missing ending sound
    assert any(w.status in ("warning", "error", "missing") for w in validated.words)

@pytest.mark.anyio
async def test_instant_assistant_handler_fallback():
    q = "Khác nhau giữa trade-off và compromise là gì?"
    res = await ask_instant_assistant(q, selected_text="trade-off", context="AI Engineering", custom_api_key="")
    validated = AssistantAskResponse(**res)
    assert len(validated.answer_vi) > 10
    assert len(validated.examples) >= 1
