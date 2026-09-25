import json
import re
import httpx
from typing import Dict, Any, List, Optional
from app.config import get_gemini_api_key, get_active_model

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Safely extracts and parses JSON even if wrapped in markdown code blocks."""
    text = raw_text.strip()
    
    # Remove markdown code fence ```json ... ```
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()
    
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try finding the first '{' and last '}'
    match = re.search(r"(\{.*\})", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
            
    # Try finding array '[...]'
    match_arr = re.search(r"(\[.*\])", text, re.DOTALL)
    if match_arr:
        try:
            return json.loads(match_arr.group(1))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse valid JSON from Gemini response:\n{raw_text}")


async def evaluate_translation(
    topic_name: str,
    vietnamese: str,
    user_english: str,
    is_voice: bool = False,
    custom_api_key: Optional[str] = None
) -> Dict[str, Any]:
    api_key = custom_api_key if custom_api_key is not None else get_gemini_api_key()
    
    # Fallback simulation if no API key is set yet
    if not api_key:
        return {
            "score": 85,
            "is_correct": True,
            "corrected_sentence": user_english.strip().capitalize() if user_english else "I am working on this task.",
            "natural_alternative": "Let's configure your Gemini API Key in Settings to get real-time AI feedback!",
            "grammar_errors": [],
            "vocabulary_tips": [
                {
                    "term": "Gemini API Key",
                    "meaning": "Vui lòng nhập Gemini API Key ở góc trên để AI sửa lỗi ngữ pháp chi tiết!",
                    "ipa": "/ˈdʒɛm.ɪ.naɪ eɪ.piː.aɪ/"
                }
            ],
            "speaking_feedback": "Giọng nói rõ ràng, chú ý nối âm và trọng âm câu.",
            "encouragement": "Bạn đang làm rất tốt! Nhập Gemini API key để nhận chấm điểm chuẩn xác nhất nhé."
        }

    model = get_active_model()
    url = f"{GEMINI_BASE_URL}/{model}:generateContent?key={api_key}"

    system_instruction = (
        "Bạn là một chuyên gia đào tạo tiếng Anh giao tiếp và tiếng Anh công nghệ chuyên sâu cho Kỹ sư AI (AI Engineer).\n"
        "Nhiệm vụ của bạn là kiểm tra câu tiếng Anh của học viên khi dịch hoặc phản xạ từ một tình huống tiếng Việt.\n"
        "Đặc biệt chú ý đến: độ tự nhiên của người bản ngữ (Collocations, Phrasal verbs), tính chuẩn xác trong môi trường công nghệ / đời sống, và ngữ pháp.\n\n"
        "BẮT BUỘC TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON (không kèm markdown rườm rà) theo đúng cấu trúc sau:\n"
        "{\n"
        '  "score": <số nguyên từ 0 đến 100>,\n'
        '  "is_correct": <true nếu ngữ pháp đúng và truyền đạt trọn vẹn, false nếu còn lỗi>,\n'
        '  "corrected_sentence": "<câu tiếng Anh đã được sửa lại hoàn hảo, tự nhiên nhất>",\n'
        '  "natural_alternative": "<cách diễn đạt tự nhiên hơn thường dùng của người bản xứ hoặc idiom/phrasal verb>",\n'
        '  "grammar_errors": [\n'
        '    {\n'
        '      "original": "<phần từ/cụm từ bị lỗi>",\n'
        '      "fix": "<phần sửa lại>",\n'
        '      "explanation": "<giải thích chi tiết bằng tiếng Việt lý do sai ngữ pháp hoặc dùng từ chưa chuẩn>"\n'
        '    }\n'
        '  ],\n'
        '  "vocabulary_tips": [\n'
        '    {\n'
        '      "term": "<từ vựng hoặc cụm hay>",\n'
        '      "meaning": "<ý nghĩa tiếng Việt và cách dùng trong công việc/đời sống>",\n'
        '      "ipa": "<phiên âm quốc tế IPA nếu có>"\n'
        '    }\n'
        '  ],\n'
        '  "speaking_feedback": "<nhận xét ngắn về ngắt nghỉ câu, nối âm và ngữ điệu giúp người học luyện nói/Shadowing>",\n'
        '  "encouragement": "<lời khen ngợi, động viên chân thành và tích cực bằng tiếng Việt>"\n'
        "}"
    )

    user_prompt = (
        f"Chủ đề giao tiếp: {topic_name}\n"
        f"Câu gốc tình huống (Tiếng Việt): \"{vietnamese}\"\n"
        f"Câu tiếng Anh của học viên ({'Đọc qua Micro' if is_voice else 'Gõ bàn phím'}): \"{user_english}\"\n\n"
        "Hãy phân tích và trả về kết quả JSON theo đúng schema đã yêu cầu."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": system_instruction + "\n\n" + user_prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1024,
            "responseMimeType": "application/json"
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload)
        if response.status_code != 200:
            error_msg = response.text
            try:
                err_json = response.json()
                error_msg = err_json.get("error", {}).get("message", error_msg)
            except Exception:
                pass
            raise RuntimeError(f"Gemini API Error ({response.status_code}): {error_msg}")

        data = response.json()
        try:
            raw_content = data["candidates"][0]["content"]["parts"][0]["text"]
            return clean_json_response(raw_content)
        except (KeyError, IndexError) as e:
            raise RuntimeError(f"Unexpected response structure from Gemini API: {e}")


async def generate_more_sentences(
    topic_name: str,
    count: int = 5,
    custom_api_key: Optional[str] = None
) -> List[Dict[str, Any]]:
    api_key = custom_api_key or get_gemini_api_key()
    if not api_key:
        raise RuntimeError("Cần cấu hình Gemini API Key để sinh thêm câu mới.")

    model = get_active_model()
    url = f"{GEMINI_BASE_URL}/{model}:generateContent?key={api_key}"

    prompt = (
        f"Bạn là chuyên gia tiếng Anh. Hãy tạo thêm {count} câu tình huống giao tiếp tiếng Việt thực tế cho chủ đề: '{topic_name}'.\n"
        "Các câu này phải tự nhiên, mang tính ứng dụng cao trong công việc hoặc đời sống hằng ngày.\n\n"
        "BẮT BUỘC TRẢ VỀ MỘT MẢNG JSON các đối tượng theo format:\n"
        "[\n"
        "  {\n"
        '    "id": "<id duy nhất ví dụ gen-1, gen-2>",\n'
        '    "vietnamese": "<câu tiếng Việt tự nhiên>",\n'
        '    "context": "<ngữ cảnh ngắn>",\n'
        '    "hint": "<gợi ý 2-3 từ vựng tiếng Anh chính>"\n'
        "  }\n"
        "]"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "responseMimeType": "application/json"
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload)
        if response.status_code != 200:
            raise RuntimeError(f"Gemini API Error: {response.text}")

        data = response.json()
        raw_content = data["candidates"][0]["content"]["parts"][0]["text"]
        result = clean_json_response(raw_content)
        if isinstance(result, list):
            return result
        elif isinstance(result, dict) and "sentences" in result:
            return result["sentences"]
        return []
