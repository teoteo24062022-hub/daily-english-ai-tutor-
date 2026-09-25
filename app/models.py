from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ConfigResponse(BaseModel):
    has_api_key: bool
    active_model: str

class SetKeyRequest(BaseModel):
    api_key: str

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
    grammar_errors: List[GrammarError] = []
    vocabulary_tips: List[VocabularyTip] = []
    speaking_feedback: Optional[str] = None
    encouragement: str

class GenerateSentencesRequest(BaseModel):
    topic_id: str
    topic_name: str
    count: int = 5
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
