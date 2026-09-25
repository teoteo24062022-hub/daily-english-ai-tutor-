# Technical Design Specification: Daily English AI Tutor (for AI Engineers & Daily Communication)

**Document Date:** 2026-09-26  
**Status:** Approved for Implementation Planning  
**Target Platform:** Node.js v24+, Modern Web Browsers (Chrome / Edge / Firefox)  
**Workspace:** `f:\ENGLISH LEARN`

---

## 1. Executive Summary & Goals

### 1.1 Background & Motivation
The user is an **AI Engineer** who wants to improve English communication skills (**Speaking, Listening, and Writing**) within a **3-month timeline**. 
Traditional grammar-only apps fail to build spontaneous speech and natural professional fluency. This application solves that by combining:
1. **Vietnamese-to-English translation & active recall** (10 sentences/day across 20 curated topics).
2. **AI-powered grammar & natural style tutoring** via Google Gemini API (detailed feedback, native-speaker alternatives, collocations, scoring 0-100).
3. **Voice Input (Speech-to-Text)** via Web Speech Recognition so the user can speak directly into the microphone instead of only typing.
4. **Interactive Listening & Shadowing (Text-to-Speech)** with selectable playback speeds (0.8x, 1.0x, 1.2x) and hide-text challenge mode.
5. **Progressive tracking**: Daily streak counter, average score, and a persistent "Mistakes Notebook" (Sổ tay lỗi sai) for spaced repetition.

---

## 2. System Architecture

The project adopts a lightweight, resilient Fullstack architecture:

```
+--------------------------------------------------------------+
|                     Browser Client (UI)                     |
|  - HTML5 / Modern CSS (Glassmorphism, Dark/Light Themes)     |
|  - Vanilla ES Modules (App, Voice, Audio, API Client, State) |
|  - Web Speech API (Speech Recognition + Speech Synthesis)   |
|  - LocalStorage (Client cache & fallback API key)            |
+------------------------------+-------------------------------+
                               | HTTP JSON REST API
                               v
+--------------------------------------------------------------+
|                   Node.js Express Server                     |
|  - `server.js` (Port 3000)                                   |
|  - `.env` Parser (GEMINI_API_KEY loader)                     |
|  - API Proxy to Gemini REST API                              |
|  - Persistence layer: `data/progress.json`, `data/topics.json`|
+------------------------------+-------------------------------+
                               | HTTPS
                               v
+--------------------------------------------------------------+
|                  Google Gemini API Server                    |
|  - Model: `gemini-2.5-flash` or `gemini-1.5-flash`          |
|  - Structured JSON evaluation response                       |
+--------------------------------------------------------------+
```

### 2.1 Backend Endpoints (`server.js`)
* `GET /api/config`: Returns status `{ hasEnvKey: boolean, activeModel: string }` without leaking the raw key.
* `POST /api/config`: Allows updating the server-side API key if provided via the UI.
* `POST /api/evaluate`: Receives `{ topicId, vietnamese, userEnglish, isVoiceInput }`, formats system prompt, calls Gemini API with JSON schema, and returns structured evaluation.
* `POST /api/generate-sentences`: Receives `{ topicId, topicName, count: 5 }` and asks Gemini to generate additional contextual sentences.
* `GET /api/topics`: Returns the full list of 20 topics with their pre-loaded sentences.
* `GET /api/progress`: Loads current learning progress, daily streak, completed days, and mistakes notebook.
* `POST /api/progress`: Appends/updates progress, daily score record, and mistake entries.

---

## 3. Curated Topics Specification (20 Topics)

The topics are strategically divided into **5 AI Engineer / Tech Workplace Topics** and **15 High-Frequency Daily Communication Topics**:

### 3.1 AI Engineer & Workplace Topics (5 Topics)
1. **Daily Standup & Sprint Updates**: Reporting completed tasks, current model training, blockers, sprint commitments.
2. **Explaining AI Models & Data Pipelines**: Describing architectures (LLM, RAG, embeddings, fine-tuning, latency, accuracy) to PMs and stakeholders.
3. **Debugging, Errors & Incident Response**: Reporting server outages, memory leaks, CUDA out-of-memory errors, API latency spikes.
4. **Code Review & Technical Feedback**: Commenting on Pull Requests, discussing refactoring, code quality, testing.
5. **Technical Meetings & Q&A**: Asking for clarification, debating technical trade-offs, discussing timelines.

### 3.2 Daily Life & Travel Topics (15 Topics)
6. **Greetings & Networking / Small Talk**
7. **Food & Cafe (Ordering, Dietary preferences, Splitting bills)**
8. **Shopping & Bargaining**
9. **Directions & Commuting**
10. **Airport, Flights & Travel**
11. **Daily Routines & Time Management**
12. **Hobbies, Sports & Leisure**
13. **Appointments & Scheduling**
14. **Weather & Emotional State**
15. **Phone & Video Calls (Signals, Interruptions)**
16. **Health & Medical Visits**
17. **Family, Friends & Social Life**
18. **Banking & Financial Transactions**
19. **Hotel Check-in & Accommodation**
20. **Emergencies & Requesting Help**

---

## 4. Gemini AI Evaluation Prompt & Schema

### 4.1 Prompt Strategy
* **Role**: Expert Bilingual English Coach specializing in natural communication and technical fluency.
* **Strict Output Format**: JSON only.
* **Tone**: Constructive, encouraging, highly specific, and clear.

### 4.2 JSON Output Schema
```json
{
  "score": 85,
  "isCorrect": true,
  "correctedSentence": "I was investigating the CUDA out-of-memory issue during the model training yesterday.",
  "naturalAlternative": "Yesterday I was digging into the CUDA OOM error we hit while training the model.",
  "grammarErrors": [
    {
      "original": "investigate about",
      "fix": "investigating",
      "explanation": "Động từ 'investigate' là ngoại động từ (transitive verb), đi trực tiếp với tân ngữ mà không cần giới từ 'about'."
    }
  ],
  "vocabularyTips": [
    {
      "term": "dig into (phrasal verb)",
      "meaning": "Tìm hiểu sâu, điều tra kỹ nguyên nhân một vấn đề kỹ thuật.",
      "ipa": "/dɪɡ ˈɪn.tuː/"
    }
  ],
  "speakingFeedback": "Ngắt nghỉ tốt sau trạng từ chỉ thời gian 'Yesterday'. Chú ý nối âm giữa 'hit' và 'while'.",
  "encouragement": "Rất tốt! Bạn đã truyền đạt chính xác ý nghĩa kỹ thuật."
}
```

---

## 5. Speaking & Listening Engine

### 5.1 Speech-to-Text (Voice Input)
* Uses `webkitSpeechRecognition` / `SpeechRecognition` native browser API.
* Language set to `en-US`.
* Features live interim results and automatic silence detection.
* Visual audio pulsing wave indicator during active recording.

### 5.2 Text-to-Speech (Pronunciation & Shadowing)
* Uses `window.speechSynthesis`.
* Voice selection prioritizes natural US English voices (`en-US` Google US English, Microsoft Jenny/Guy, or Samantha).
* Speed controls: `0.8x` (Slow for phonetics & beginners), `1.0x` (Normal conversational pace), `1.2x` (Native natural speed).
* Audio button available for both the user's typed sentence and the AI's corrected sentence.

---

## 6. Daily Flow & Progress Tracking

* **Daily Target**: 10 sentences per session.
* **Streak Calculation**:
  * If the user completes 10 sentences on consecutive calendar dates, increment `streakCount`.
  * If a day is missed, reset streak to 1.
* **Mistakes Notebook**:
  * Automatically records any sentence where `score < 75` or `grammarErrors.length > 0`.
  * Allows one-click "Practice Again" mode to re-test previously missed sentences.
* **Persistence**:
  * Primary: Synced via `POST /api/progress` to local file `data/progress.json`.
  * Fallback: Mirrored in browser `localStorage`.

---

## 7. User Interface & Design System

* **Theme**: Deep Dark Mode with vibrant indigo/cyan accents (`#6366f1` / `#06b6d4`) and clean light mode toggle.
* **Layout**:
  * **Top Bar**: App logo, Daily Streak badge (`🔥 5 Days`), Today's Progress (`7/10 sentences`), Theme toggle, Settings icon (API key config).
  * **Topic Selector Bar**: Horizontal scrollable chips or dropdown with icons for 20 topics.
  * **Main Practice Card**:
    * Context sentence card in Vietnamese (highlighted keyword hints).
    * Input zone: Large textarea + Microphone button for voice input.
    * Action row: "Check Answer" button, "Skip", "Show Hint".
  * **AI Coach Feedback Drawer / Card**:
    * Score Badge (Color-coded: Green 85-100, Yellow 65-84, Red <65).
    * Corrected Sentence with Speaker icon.
    * Native Speaker Alternative ("How a native speaker would say it").
    * Grammar breakdown table/cards with Vietnamese explanations.
    * Vocabulary & Phrasal verb spotlight.
  * **Mistakes Notebook Modal**: Filter by topic, review past errors, and retry.

---

## 8. Directory & File Structure

```
f:\ENGLISH LEARN\
├── .env                       # Stores GEMINI_API_KEY
├── .env.example               # Example template
├── package.json               # Express, dotenv, cors
├── server.js                  # Main Node.js server & API proxy
├── data/
│   ├── topics.json            # 20 topics with initial curated sentences
│   └── progress.json          # Daily streaks, history, mistakes
└── public/
    ├── index.html             # Single Page Application entry
    ├── css/
    │   ├── style.css          # Core design tokens, layout & animations
    │   └── components.css     # Card, buttons, badge, audio wave styles
    └── js/
        ├── app.js             # Main orchestrator & UI events
        ├── api.js             # Server API client
        ├── speech.js          # Speech-to-Text & Text-to-Speech logic
        └── state.js           # Progress, streak & notebook state management
```

---

## 9. Verification & Acceptance Criteria

1. **Server Boot**: `npm start` launches server on port 3000 without errors.
2. **API Key Setup**: System functions smoothly when API key is loaded via `.env` or saved in UI settings.
3. **Evaluation Quality**: Gemini returns valid JSON parsing cleanly into scores, grammar corrections, native alternatives, and Vietnamese explanations.
4. **Speech Capabilities**:
   - Microphone records English speech accurately.
   - Speaker plays natural audio at 0.8x, 1.0x, and 1.2x speeds.
5. **Progress & Streak**: Completing sentences updates progress bar and persists across page reloads.
6. **Mistakes Notebook**: Weak sentences are captured and can be re-practiced.
