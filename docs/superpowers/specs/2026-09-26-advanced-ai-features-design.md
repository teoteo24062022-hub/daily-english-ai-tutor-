# Technical Design Spec: 4 Tính Năng AI Đột Phá Cho Daily English AI Tutor

- **Tài liệu**: `docs/superpowers/specs/2026-09-26-advanced-ai-features-design.md`
- **Ngày tạo**: 2026-09-26
- **Trạng thái**: Đã phê duyệt kiến trúc (Approved for Planning)
- **Tác giả**: Antigravity AI & Pair Programmer

---

## 1. Tổng Quan Mục Tiêu & Bối Cảnh

Ứng dụng **Daily English AI Tutor** hiện đã sở hữu:
- Lộ trình 3 tháng toàn diện từ A0 lên B2 (90 ngày).
- Kho 4,016 từ vựng chuẩn Oxford A1-B2 kèm thuật toán Spaced Repetition (SRS Flashcard 3D).
- 20 chủ đề luyện phản xạ giao tiếp với trợ lý đánh giá ngữ pháp Gemini AI.
- Bảng 44 âm quốc tế IPA tương tác.

Bản đặc tả thiết kế này mô tả việc bổ sung **4 phân hệ AI cao cấp** giúp học viên đạt trình độ giao tiếp thực tế và làm chủ tiếng Anh chuyên ngành Công nghệ thông tin / Kỹ sư AI:
1. **🎭 AI Voice Roleplay Arena**: Đàm thoại nhập vai giọng nói 2 chiều thời gian thực với AI theo các kịch bản Tech & AI Engineer chuyên sâu, kèm bản đánh giá mổ xẻ (Debriefing) sau buổi nói.
2. **📖 AI Smart Contextual Story Generator**: Tự động sáng tác các mẩu chuyện công sở Tech hấp dẫn từ các từ vựng SRS đang cần ôn để người học ghi nhớ từ vựng sâu qua ngữ cảnh.
3. **🎯 AI Pronunciation Diagnostics & Shadowing**: Soi chi tiết từng từ phát âm, chỉ ra chính xác các lỗi nuốt âm đuôi (*-s, -ed, -t, -k*) với màu sắc trực quan (Xanh / Vàng / Đỏ), chấm điểm 0-100% và hỗ trợ luyện nhại giọng (Shadowing 0.8x / 1.0x).
4. **💡 Instant AI Explain Assistant**: Widget gia sư AI nổi tại chỗ, giải thích ngữ pháp và sắc thái từ tiếng Anh bất kỳ lúc nào chỉ bằng 1 click.

---

## 2. Kiến Trúc Hệ Thống & Luồng Dữ Liệu (System Architecture)

```mermaid
graph TD
    subgraph Frontend [Giao diện Người dùng Web]
        TabNav[Top Navigation Tabs]
        RoleplayView[Tab 4: 🎭 AI Voice Roleplay Arena]
        VocabView[Tab 2: 🗂️ Kho Từ Vựng SRS]
        PracticeView[Tab 3: 🎙️ Luyện Phản Xạ & Giàn Giáo]
        FloatWidget[💡 Floating AI Assistant Widget]
        
        VocabView --> StoryModal[✨ Story Generator Modal]
        PracticeView --> PronunDiff[🎯 Pronunciation Diff Visualizer]
    end

    subgraph Backend [FastAPI Backend Service]
        RP_Chat[/api/roleplay/chat]
        RP_Debrief[/api/roleplay/debrief]
        Story_Gen[/api/story/generate]
        Pronun_Eval[/api/pronunciation/evaluate]
        Assist_Ask[/api/assistant/ask]
    end

    subgraph AI_Core [Gemini AI Engine & Offline Fallbacks]
        GeminiClient[Google Gemini API]
        OfflineEngine[Heuristic Fallback Engine]
    end

    RoleplayView --> RP_Chat
    RoleplayView --> RP_Debrief
    StoryModal --> Story_Gen
    PronunDiff --> Pronun_Eval
    FloatWidget --> Assist_Ask

    RP_Chat --> GeminiClient & OfflineEngine
    RP_Debrief --> GeminiClient & OfflineEngine
    Story_Gen --> GeminiClient & OfflineEngine
    Pronun_Eval --> OfflineEngine
    Assist_Ask --> GeminiClient & OfflineEngine
```

---

## 3. Đặc Tả Chi Tiết Từng Phân Hệ Tính Năng

### 3.1. Phân Hệ 1: 🎭 AI Voice Roleplay Arena (Hội thoại nhập vai AI)

#### Kịch bản chuyên ngành Tech & AI Engineer
Hệ thống cung cấp sẵn 5 kịch bản tuyển chọn:
1. `scenario-tech-interview`: **AI Engineer Job Interview**  
   *AI Role*: Lead AI Scientist tại một công ty công nghệ lớn ở San Francisco.  
   *Mục tiêu*: Phỏng vấn ứng viên về kinh nghiệm tối ưu hóa mô hình LLM, Fine-tuning, độ trễ và giải pháp giảm bớt ảo giác (hallucination).
2. `scenario-daily-standup`: **Agile Sprint Daily Standup**  
   *AI Role*: Scrum Master kiêm Tech Lead.  
   *Mục tiêu*: Người học báo cáo 3 câu: Hôm qua làm gì (*Yesterday I refactored...*), hôm nay làm gì (*Today I will implement...*), và có blocker nào không. AI phản hồi và đặt câu hỏi phụ.
3. `scenario-bug-triage`: **Production Incident Post-Mortem**  
   *AI Role*: Senior Site Reliability Engineer (SRE).  
   *Mục tiêu*: Thảo luận nguyên nhân gây nghẽn cổ chai (bottleneck) dẫn tới sập server lúc 2 giờ sáng và đề xuất phương án dự phòng (redundancy).
4. `scenario-architecture`: **System Architecture & Trade-off Debate**  
   *AI Role*: Chief Technology Officer (CTO).  
   *Mục tiêu*: Tranh luận về việc lựa chọn giải pháp: Trade-off giữa tốc độ phản hồi (latency) và chi phí phần cứng (throughput & GPU memory).
5. `scenario-client-demo`: **Product Technical Demo**  
   *AI Role*: Giám đốc công nghệ phía khách hàng doanh nghiệp.  
   *Mục tiêu*: Người học trình bày giải pháp phần mềm, giải đáp thắc mắc về tính bảo mật và khả năng mở rộng (scalability).

#### Luồng hoạt động (User Flow)
1. Người học chọn kịch bản trong danh sách và bấm **"Bắt đầu hội thoại"**.
2. AI gửi lời chào mở đầu (Audio đọc tự động + bong bóng chat).
3. Người học bấm nút Mic (hoặc gõ phím) để phản hồi bằng tiếng Anh.
4. AI ghi nhận, phân tích bối cảnh và phản hồi tự nhiên trong vai nhân vật.
5. Người học có thể trao đổi từ 3 đến 10 lượt. Bất cứ lúc nào người học cũng có thể bấm **"Kết thúc & Nhận bản phân tích"**.
6. Hệ thống gọi endpoint `/api/roleplay/debrief` để trả về báo cáo:
   - **Fluency Rating**: Chấm điểm mức độ lưu loát (CEFR A1, A2, B1, B2).
   - **Grammar & Word Fixes**: Chỉ ra 2-3 lỗi diễn đạt chưa chuẩn kèm câu sửa.
   - **Native Upgrades**: Đề xuất cách nói tự nhiên chuẩn kỹ sư bản ngữ Mỹ.
   - **Key Tech Terms Used**: Danh sách các thuật ngữ chuyên môn được áp dụng thành công.

---

### 3.2. Phân Hệ 2: 📖 AI Smart Contextual Story Generator (Truyện ngữ cảnh từ vựng SRS)

#### Luồng hoạt động
1. Từ Tab Kho từ vựng, người học bấm nút **"✨ Sáng tác truyện từ các từ cần ôn"** (hoặc chọn 5–8 từ bất kỳ trong danh sách).
2. Hệ thống gửi danh sách các từ vựng này về `/api/story/generate`.
3. Gemini AI sáng tác:
   - **Tiêu đề truyện**: Hấp dẫn, mang màu sắc câu chuyện văn phòng công nghệ, startup hoặc đời sống thực tế.
   - **Nội dung tiếng Anh**: Đoạn văn 150 - 250 từ, lồng ghép tự nhiên các từ vựng mục tiêu (được bôi đậm hoặc đánh dấu để học viên bấm vào xem nghĩa/IPA).
   - **Bản dịch song ngữ tiếng Việt**: Có nút toggle bật/tắt hiển thị tiếng Việt để học viên tự thử sức dịch trước khi xem đáp án.
   - **Mini Fill-in-the-blank Quiz**: 3 câu hỏi trắc nghiệm kiểm tra khả năng nhớ từ trong ngữ cảnh câu chuyện.
   - **Audio Player**: Nút bấm nghe AI đọc trôi chảy toàn bộ câu chuyện với giọng chuẩn US.

---

### 3.3. Phân Hệ 3: 🎯 AI Pronunciation Diagnostics & Shadowing (Chấm phát âm & Âm đuôi)

#### Thuật toán so khớp từ vựng & âm vị (Word-level Phoneme Diff)
Khi học viên nói câu tiếng Anh (qua Web Speech API hoặc audio input), hệ thống nhận diện văn bản thu được và chuyển về endpoint `/api/pronunciation/evaluate`:
- **Word alignment**: So sánh từng từ trong `spoken_text` với `target_sentence`.
- **Phát hiện lỗi âm đuôi (Ending Sound Detection)**:
  - Nếu từ mẫu có âm đuôi như `/s/`, `/z/`, `/t/`, `/d/`, `/k/`, `/θ/` mà từ nhận diện bị thiếu (ví dụ mẫu là *works* nhưng đọc thành *work*, mẫu là *launched* nhưng đọc thành *launch*), hệ thống gắn nhãn cảnh báo: `"Thiếu âm đuôi /s/"` hoặc `"Thiếu âm /t/"`.
- **Màu sắc hiển thị trực quan**:
  - 🟢 **Xanh lá**: Phát âm chuẩn xác 100%.
  - 🟡 **Vàng**: Phát âm gần đúng hoặc thiếu âm đuôi.
  - 🔴 **Đỏ**: Phát âm sai hoặc bỏ sót từ.
- **Thang điểm**: Tính tỷ lệ từ phát âm đúng trên tổng số từ để ra điểm phần trăm (0 - 100%).
- **Shadowing Player**: Cho phép nghe câu mẫu ở các tốc độ `0.8x` (chậm rõ), `1.0x` (chuẩn), và `1.2x` (nhanh bản ngữ) để học viên nhại lại từng nhịp thở.

---

### 3.4. Phân Hệ 4: 💡 Instant AI Explain Assistant (Gia sư ảo thông minh tại chỗ)

#### Thiết kế Widget
- Một nút nổi tròn mang biểu tượng `💡 Trợ lý AI` nằm cố định ở góc dưới cùng bên phải màn hình (`bottom: 2rem; right: 2rem`).
- Khi bấm vào, một Drawer / Popover glassmorphic mở ra mượt mà với:
  - Ô nhập câu hỏi nhanh (*VD: "Phân biệt 'latency' và 'delay'?", "Giải thích cấu trúc 'had better'?"*).
  - Tự động nhận diện văn bản đang bôi đen trên trang nếu có (học viên chỉ cần bôi đen 1 từ hoặc 1 câu rồi bấm vào nút nổi là câu hỏi đã được điền sẵn).
  - Phản hồi từ `/api/assistant/ask`: Trả lời ngắn gọn, có cấu trúc:
    - 📌 **Giải thích cốt lõi**: Định nghĩa đơn giản, súc tích.
    - 💡 **Ví dụ minh họa**: 2 câu ví dụ thực tế.
    - ⚠️ **Lỗi phổ biến cần tránh**: Điểm người Việt hay dùng sai.

---

## 4. Đặc Tả Dữ Liệu & API Endpoints

### 4.1. Schemas (Pydantic Models trong `app/models.py`)

```python
# 1. Roleplay Models
class RoleplayMessage(BaseModel):
    role: str  # "ai" or "user"
    content: str
    timestamp: Optional[str] = None

class RoleplayChatRequest(BaseModel):
    scenario_id: str
    messages: List[RoleplayMessage]
    user_input: str
    custom_api_key: Optional[str] = ""

class RoleplayDebriefRequest(BaseModel):
    scenario_id: str
    messages: List[RoleplayMessage]
    custom_api_key: Optional[str] = ""

class RoleplayDebriefResponse(BaseModel):
    fluency_level: str  # "A2 - Elementary", "B1 - Intermediate", "B2 - Upper Intermediate"
    overall_score: int  # 0 - 100
    summary: str
    grammar_corrections: List[Dict[str, str]]  # [{"original": "...", "improved": "...", "explanation": "..."}]
    native_upgrades: List[Dict[str, str]]      # [{"formal_or_basic": "...", "native_expression": "..."}]
    tech_terms_used: List[str]

# 2. Story Generator Models
class StoryGenerateRequest(BaseModel):
    words: List[str]  # e.g. ["bottleneck", "latency", "scalability"]
    theme: Optional[str] = "tech_work"  # "tech_work" or "daily_life"
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
    words_included: List[str]
    quiz: List[StoryQuizQuestion]

# 3. Pronunciation Models
class PronunciationEvalRequest(BaseModel):
    target_sentence: str
    spoken_text: str

class WordScore(BaseModel):
    word: str
    status: str  # "correct", "warning", "error", "missing"
    issue: Optional[str] = None  # e.g., "Thiếu âm đuôi /s/"

class PronunciationEvalResponse(BaseModel):
    overall_score: int  # 0 - 100
    words: List[WordScore]
    feedback_vi: str

# 4. Instant AI Assistant Models
class AssistantAskRequest(BaseModel):
    question: str
    selected_text: Optional[str] = ""
    context: Optional[str] = ""
    custom_api_key: Optional[str] = ""

class AssistantAskResponse(BaseModel):
    answer_vi: str
    examples: List[str] = []
    tips: Optional[str] = None
```

---

## 5. Kế Hoạch Kiểm Thử (Verification Plan)

### 5.1. Automated Unit & Integration Tests (Pytest)
1. `tests/test_roleplay.py`:
   - Kiểm tra `POST /api/roleplay/chat` phản hồi kịch bản AI Engineer hợp lệ.
   - Kiểm tra `POST /api/roleplay/debrief` chấm điểm và trả về cấu trúc Fluency, Grammar Fixes, Native Upgrades.
   - Kiểm tra cơ chế Offline Fallback khi không có API key.
2. `tests/test_story_generator.py`:
   - Kiểm tra `POST /api/story/generate` nhận danh sách từ vựng và trả về truyện song ngữ kèm câu hỏi trắc nghiệm.
3. `tests/test_pronunciation.py`:
   - Kiểm tra `POST /api/pronunciation/evaluate` với các trường hợp phát âm chuẩn, phát âm sai và thiếu âm đuôi `-s`, `-ed`.
4. `tests/test_assistant.py`:
   - Kiểm tra `POST /api/assistant/ask` giải thích ngữ pháp và từ vựng nhanh.

### 5.2. Live Browser End-to-End Verification
- Chuyển đổi giữa 4 tab trên menu: Lộ trình, Từ vựng, Luyện câu, Hội thoại AI.
- Thử nghiệm đàm thoại thoại 2 chiều trong vai phỏng vấn kỹ thuật AI Engineer.
- Thử nghiệm bấm nút sáng tác truyện từ vựng SRS.
- Thử nghiệm phát âm và quan sát giao diện tô màu Xanh/Vàng/Đỏ trực quan.
- Thử nghiệm mở widget gia sư nổi và hỏi đáp nhanh.

---

## 6. Cam Kết Thiết Kế Giao Diện (Aesthetics & UX)
- Duy trì chuẩn thiết kế Glassmorphism đẳng cấp với bảng màu HSL (`--bg-primary: #0a0f1d`, `--accent-primary: #6366f1`, `--accent-cyan: #06b6d4`, `--accent-emerald: #10b981`).
- Micro-animations mượt mà cho bong bóng hội thoại chat, thanh phân tích phát âm và thẻ truyện.
- Hoạt động 100% không gián đoạn nhờ hệ thống Prompt chuyên sâu kết hợp bộ xử lý giả lập thông minh khi chưa có Gemini API key.
