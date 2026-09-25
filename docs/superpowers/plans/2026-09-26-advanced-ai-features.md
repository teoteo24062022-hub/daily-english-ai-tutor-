# 4 Advanced AI Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai 4 tính năng AI cao cấp (Hội thoại nhập vai AI Roleplay Tech/AI Engineer, Sáng tác truyện ngữ cảnh từ vựng SRS, Chấm phát âm & Âm đuôi kèm Shadowing, và Gia sư AI hỏi đáp tại chỗ) cho Daily English AI Tutor.

**Architecture:** Bổ sung 5 endpoint REST API trong backend FastAPI kèm Gemini prompt engine và offline fallback; mở rộng Frontend Vanilla JS/CSS với Tab Roleplay mới, Story Modal, Pronunciation Word-diff, và Floating AI Assistant Widget.

**Tech Stack:** Python 3.11, FastAPI, Pydantic, Google Gemini API, Web Speech API (STT & TTS), Vanilla JavaScript, CSS Glassmorphism.

**Spec:** [docs/superpowers/specs/2026-09-26-advanced-ai-features-design.md](file:///f:/ENGLISH%20LEARN/docs/superpowers/specs/2026-09-26-advanced-ai-features-design.md)

## Global Constraints
- Tất cả endpoint mới phải có offline fallback engine hoạt động chính xác khi không có API key.
- Không đưa vào dependency mới ngoài thư viện chuẩn và FastAPI/Pydantic/httpx đã cài đặt.
- Tuân thủ phong cách CSS Glassmorphism với bảng màu HSL sẵn có (`--bg-primary: #0a0f1d`, `--accent-primary: #6366f1`, `--accent-cyan: #06b6d4`, `--accent-emerald: #10b981`).
- Mọi tương tác giọng nói phải sử dụng `speakText` từ [public/js/speech.js](file:///f:/ENGLISH%20LEARN/public/js/speech.js).

## Review Focus
- Trường hợp người dùng ngắt lời hoặc gửi tin nhắn trống trong Roleplay -> cần validation trả về thông báo lỗi thân thiện.
- Trường hợp kịch bản Roleplay trao đổi nhiều lượt -> prompt cần tóm tắt bối cảnh để không vượt context window.
- Trường hợp danh sách từ vựng SRS gửi vào Story Generator ít hơn 2 từ -> tự động bổ sung từ ngẫu nhiên trong kho.
- Trường hợp chuỗi giọng nói nhận diện bị lệch từ so với câu mẫu -> thuật toán Word-diff phải căn chỉnh chính xác vị trí không làm crash giao diện.
- Trợ lý AI nổi (Floating Assistant) không được che khuất các nút điều khiển quan trọng trên màn hình nhỏ.

---

### Task 1: Backend Data Models & Core Gemini AI Handlers

**Files:**
- Modify: `app/models.py`
- Modify: `app/gemini.py`
- Test: `tests/test_ai_core.py`

**Interfaces:**
- Produces:
  - `RoleplayChatRequest`, `RoleplayDebriefRequest`, `RoleplayDebriefResponse`
  - `StoryGenerateRequest`, `StoryGenerateResponse`
  - `PronunciationEvalRequest`, `PronunciationEvalResponse`, `WordScore`
  - `AssistantAskRequest`, `AssistantAskResponse`
  - Functions in `app/gemini.py`:
    - `generate_roleplay_chat(scenario_id: str, messages: list, user_input: str, custom_api_key: str) -> dict`
    - `generate_roleplay_debrief(scenario_id: str, messages: list, custom_api_key: str) -> dict`
    - `generate_vocabulary_story(words: list, theme: str, custom_api_key: str) -> dict`
    - `evaluate_pronunciation_diff(target_sentence: str, spoken_text: str) -> dict`
    - `ask_instant_assistant(question: str, selected_text: str, context: str, custom_api_key: str) -> dict`

- [ ] **Step 1: Write the failing test**
Create `tests/test_ai_core.py` testing schemas and fallback responses for all 5 core functions.

- [ ] **Step 2: Run test to verify it fails**
Run: `& "f:\ENGLISH LEARN\.venv\Scripts\pytest" tests/test_ai_core.py -v`
Expected: FAIL with ImportErrors.

- [ ] **Step 3: Implement Pydantic models in `app/models.py` and AI functions with fallbacks in `app/gemini.py`**
Add the 10 models and 5 handler functions.

- [ ] **Step 4: Run test to verify it passes**
Run: `& "f:\ENGLISH LEARN\.venv\Scripts\pytest" tests/test_ai_core.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add app/models.py app/gemini.py tests/test_ai_core.py
git commit -m "feat: add data models and gemini handlers for 4 advanced AI features"
```

---

### Task 2: FastAPI Endpoints & Integration Tests

**Files:**
- Modify: `main.py`
- Test: `tests/test_advanced_ai_api.py`

**Interfaces:**
- Consumes: Models from `app/models.py` and functions from `app/gemini.py`
- Produces:
  - `GET /api/roleplay/scenarios`
  - `POST /api/roleplay/chat`
  - `POST /api/roleplay/debrief`
  - `POST /api/story/generate`
  - `POST /api/pronunciation/evaluate`
  - `POST /api/assistant/ask`

- [ ] **Step 1: Write the failing integration test**
Create `tests/test_advanced_ai_api.py` testing all 6 endpoints with valid requests and edge cases.

- [ ] **Step 2: Run test to verify it fails**
Run: `& "f:\ENGLISH LEARN\.venv\Scripts\pytest" tests/test_advanced_ai_api.py -v`
Expected: FAIL with 404 Not Found.

- [ ] **Step 3: Implement endpoints in `main.py`**
Register `GET /api/roleplay/scenarios` with the 5 curated Tech & AI Engineer scenarios, and register the 5 POST routes calling `app.gemini` handlers.

- [ ] **Step 4: Run test to verify it passes**
Run: `& "f:\ENGLISH LEARN\.venv\Scripts\pytest" tests/test_advanced_ai_api.py -v`
Expected: PASS with 6/6 tests.

- [ ] **Step 5: Commit**
```bash
git add main.py tests/test_advanced_ai_api.py
git commit -m "feat: add REST endpoints for roleplay, story generator, pronunciation and assistant"
```

---

### Task 3: Frontend API Client & State Management

**Files:**
- Modify: `public/js/api.js`
- Modify: `public/js/state.js`

**Interfaces:**
- Produces:
  - `fetchRoleplayScenarios()`, `sendRoleplayChat()`, `fetchRoleplayDebrief()`, `generateVocabStory()`, `evaluatePronunciation()`, `askAiAssistant()`
  - State properties: `state.roleplay`, `state.story`, `state.pronunciation`, `state.assistant`

- [ ] **Step 1: Add API client functions in `public/js/api.js`**
Add clean fetch wrappers with error handling for all 6 endpoints.

- [ ] **Step 2: Add state variables and setters in `public/js/state.js`**
Add `state.roleplay` with scenario list and message array; `state.story` with current story; `state.pronunciation` with latest evaluation; and `state.assistant` with conversation history.

- [ ] **Step 3: Verification**
Verify syntax and imports using node or python syntax check.

- [ ] **Step 4: Commit**
```bash
git add public/js/api.js public/js/state.js
git commit -m "feat: add frontend api functions and state tracking for advanced AI features"
```

---

### Task 4: Frontend UI - AI Voice Roleplay Arena (Tab 4)

**Files:**
- Modify: `public/index.html`
- Modify: `public/css/components.css`
- Modify: `public/js/app.js`

**Interfaces:**
- Consumes: `fetchRoleplayScenarios()`, `sendRoleplayChat()`, `fetchRoleplayDebrief()`, `speakText()`
- Produces:
  - Tab button `#tab-btn-roleplay` and view section `#view-roleplay`
  - Scenario selector grid with 5 Tech & AI engineer scenarios
  - Interactive chat stream with audio bubbles, voice microphone toggle, and debriefing report modal

- [ ] **Step 1: Add HTML markup in `public/index.html`**
Add nav button `🎭 Hội thoại AI` and the `#view-roleplay` container. Add `#modal-roleplay-debrief`.

- [ ] **Step 2: Add CSS styling in `public/css/components.css`**
Add glassmorphic chat bubbles, pulse recording animations, scenario cards, and report modal metrics.

- [ ] **Step 3: Implement controller logic in `public/js/app.js`**
Implement scenario selection, voice input handling, auto-TTS speaker, message appending, and debrief report generation.

- [ ] **Step 4: Verification**
Check tab switching and UI rendering.

- [ ] **Step 5: Commit**
```bash
git add public/index.html public/css/components.css public/js/app.js
git commit -m "feat: implement AI Voice Roleplay Arena UI with Tech scenarios and debrief modal"
```

---

### Task 5: Frontend UI - Smart Story Generator, Pronunciation Diff & Floating Assistant

**Files:**
- Modify: `public/index.html`
- Modify: `public/css/components.css`
- Modify: `public/js/app.js`

**Interfaces:**
- Consumes: `generateVocabStory()`, `evaluatePronunciation()`, `askAiAssistant()`
- Produces:
  - Story Generator Modal in `#view-vocabulary`
  - Word-level Pronunciation Diff chips in `#view-practice` feedback drawer
  - Floating Assistant button `#btn-floating-assistant` and slide-out drawer `#drawer-ai-assistant`

- [ ] **Step 1: Add markup in `public/index.html`**
Add button `✨ Sáng tác truyện AI` in vocabulary toolbar, Story modal, Pronunciation diff area in practice view, and Floating Assistant drawer at body end.

- [ ] **Step 2: Add CSS in `public/css/components.css`**
Add styles for bilingual story reader, green/yellow/red word pronunciation chips, and floating assistant widget.

- [ ] **Step 3: Implement controller logic in `public/js/app.js`**
Wire up story generation from SRS due words, integrate pronunciation word-level evaluation into voice input, and connect floating assistant drawer with selection listener.

- [ ] **Step 4: Verification**
Check modal openings, word chip rendering, and floating drawer toggle.

- [ ] **Step 5: Commit**
```bash
git add public/index.html public/css/components.css public/js/app.js
git commit -m "feat: implement Story Generator, Pronunciation Diff, and Floating AI Assistant UI"
```

---

### Task 6: Full Verification, Pytest & Browser End-to-End Walkthrough

**Files:**
- Test: `tests/`
- Documentation: `docs/superpowers/plans/2026-09-26-advanced-ai-features.md`
- Artifact: `walkthrough.md`

- [ ] **Step 1: Run complete automated test suite**
Run: `& "f:\ENGLISH LEARN\.venv\Scripts\pytest"`
Expected: ALL tests pass (14 existing + new tests).

- [ ] **Step 2: Browser End-to-End Testing via subagent**
Verify all 4 features on `http://127.0.0.1:8000`:
- Switch to Tab `🎭 Hội thoại AI`, select "AI Engineer Job Interview", send a message via voice/text, observe AI response with audio.
- Test "Kết thúc & Xem báo cáo" in Roleplay.
- Open Vocabulary tab, click "✨ Sáng tác truyện AI", verify story and bilingual toggle.
- Go to Practice Arena, speak a sentence, verify Pronunciation diff chips.
- Click Floating AI Assistant button, ask a grammar question, verify answer.

- [ ] **Step 3: Document walkthrough and commit final changes**
Update `walkthrough.md` with screenshots and verification results.
