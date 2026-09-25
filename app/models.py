from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ConfigResponse(BaseModel):
    has_api_key: bool
    active_model: str

class SetKeyRequest(BaseModel):
    api_key: Optional[str] = None
    model: Optional[str] = None


class Sentence(BaseModel):
    id: str
    vietnamese: str
    context: Optional[str] = None
    hint: Optional[str] = None

class Topic(BaseModel):
    id: str
    name: str
    icon: str
    category: str  # "tech" or "daily"
    description: str
    sentences: List[Sentence] = []

class GrammarError(BaseModel):
    original: str
    fix: str
    explanation: str

class VocabularyTip(BaseModel):
    term: str
    meaning: str
    ipa: Optional[str] = None

class GrammarlyMetric(BaseModel):
    correctness: int = 85
    clarity: int = 85
    engagement: int = 80
    delivery: int = 85

class InlineSuggestion(BaseModel):
    original: str
    replacement: str
    type: str = "grammar"  # "grammar", "clarity", "vocabulary", "tone"
    explanation: str

class EvaluationRequest(BaseModel):
    topic_id: str
    vietnamese: str
    user_english: str
    is_voice: bool = False
    custom_api_key: Optional[str] = None

class EvaluationResult(BaseModel):
    score: int = Field(ge=0, le=100)
    is_correct: bool
    corrected_sentence: str
    natural_alternative: str
    metrics: GrammarlyMetric = Field(default_factory=GrammarlyMetric)
    inline_suggestions: List[InlineSuggestion] = []
    grammar_errors: List[GrammarError] = []
    vocabulary_tips: List[VocabularyTip] = []
    speaking_feedback: Optional[str] = None
    encouragement: str

class QuickCheckRequest(BaseModel):
    text: str
    topic_name: Optional[str] = "General"
    custom_api_key: Optional[str] = None

class QuickCheckResult(BaseModel):
    score: int = 85
    metrics: GrammarlyMetric = Field(default_factory=GrammarlyMetric)
    inline_suggestions: List[InlineSuggestion] = []
    corrected_text: str
    summary: str

class GenerateSentencesRequest(BaseModel):
    topic_id: str
    topic_name: str
    count: int = 5
    custom_api_key: Optional[str] = None

class CreateTopicRequest(BaseModel):
    topic_name: str
    category: str = "tech"  # "tech" or "daily"
    count: int = 10
    custom_api_key: Optional[str] = None

class MistakeItem(BaseModel):
    id: str
    topic_id: str
    vietnamese: str
    user_english: str
    corrected_sentence: str
    explanation: str
    timestamp: str

class ProgressRecord(BaseModel):
    streak: int = 0
    last_date: Optional[str] = None
    total_completed: int = 0
    today_completed: int = 0
    today_date: Optional[str] = None
    mistakes: List[MistakeItem] = []

class ProgressUpdateRequest(BaseModel):
    date: str
    completed_increment: int = 1
    score: int
    mistake_item: Optional[MistakeItem] = None

class VocabularyItem(BaseModel):
    id: str
    word: str
    ipa: Optional[str] = None
    part_of_speech: Optional[str] = "noun"
    level: Optional[str] = "A0-Survival"
    meaning: str
    example_en: str
    example_vi: Optional[str] = None
    mnemonic: Optional[str] = None
    srs_stage: int = 1
    next_review: str
    review_count: int = 0

class VocabularyReviewRequest(BaseModel):
    vocab_id: str
    grade: int  # 0: Again, 1: Hard, 2: Good, 3: Easy

class AddCustomWordRequest(BaseModel):
    word: str
    ipa: Optional[str] = None
    part_of_speech: Optional[str] = "noun"
    level: Optional[str] = "A1-Daily"
    meaning: str
    example_en: str
    example_vi: Optional[str] = None
    mnemonic: Optional[str] = None

class AiWordGenerateRequest(BaseModel):
    word: str
    context_hint: Optional[str] = None
    custom_api_key: Optional[str] = None

class AiWordGenerateResponse(BaseModel):
    word: str
    ipa: str
    part_of_speech: str
    level: str
    meaning: str
    example_en: str
    example_vi: str
    mnemonic: str

class RoadmapPhase(BaseModel):
    id: str
    number: int
    title: str
    subtitle: str
    days_range: str
    color: str
    description: str

class RoadmapDay(BaseModel):
    day: int
    phase: int
    title: str
    goal: str
    theory: str
    core_vocab: List[str] = []
    sample_sentence: str
    practice_tip: str

class RoadmapData(BaseModel):
    current_day: int = 1
    completed_days: List[int] = []
    phases: List[RoadmapPhase] = []
    days: List[RoadmapDay] = []

class CompleteDayRequest(BaseModel):
    day: int


# ========================================================
# 4 ADVANCED AI FEATURES MODELS
# ========================================================

class RoleplayMessage(BaseModel):
    role: str  # "ai" or "user"
    content: str
    timestamp: Optional[str] = None

class RoleplayChatRequest(BaseModel):
    scenario_id: str
    messages: List[RoleplayMessage] = []
    user_input: str
    custom_api_key: Optional[str] = ""

class RoleplayDebriefRequest(BaseModel):
    scenario_id: str
    messages: List[RoleplayMessage]
    custom_api_key: Optional[str] = ""

class RoleplayDebriefResponse(BaseModel):
    fluency_level: str
    overall_score: int
    summary: str
    grammar_corrections: List[Dict[str, str]] = []
    native_upgrades: List[Dict[str, str]] = []
    tech_terms_used: List[str] = []

class StoryGenerateRequest(BaseModel):
    words: List[str] = []
    theme: Optional[str] = "tech_work"
    custom_api_key: Optional[str] = ""

class StoryQuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class StoryGenerateResponse(BaseModel):
    title_en: str
    title_vi: str
    content_en: str
    content_vi: str
    words_included: List[str] = []
    quiz: List[StoryQuizQuestion] = []

class PronunciationEvalRequest(BaseModel):
    target_sentence: str
    spoken_text: str

class WordScore(BaseModel):
    word: str
    status: str  # "correct", "warning", "error", "missing"
    issue: Optional[str] = None

class PronunciationEvalResponse(BaseModel):
    overall_score: int
    words: List[WordScore] = []
    feedback_vi: str

class AssistantAskRequest(BaseModel):
    question: str
    selected_text: Optional[str] = ""
    context: Optional[str] = ""
    custom_api_key: Optional[str] = ""

class AssistantAskResponse(BaseModel):
    answer_vi: str
    examples: List[str] = []
    tips: Optional[str] = None


