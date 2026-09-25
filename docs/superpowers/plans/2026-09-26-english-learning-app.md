# Daily English AI Tutor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive local web application with Node.js that enables an AI Engineer to practice 10 daily Vietnamese-to-English communication sentences across 20 topics, with real-time Gemini AI grading, grammar breakdown, native-sounding alternatives, voice input (speech-to-text), multi-speed pronunciation audio, and progress tracking.

**Architecture:** A lightweight Node.js/Express server acts as an API proxy to Google Gemini REST API and persists progress/topics to JSON files. The frontend is a modern, responsive Single Page Application with vanilla HTML/CSS/ES Modules utilizing the Web Speech API for voice recognition and speech synthesis.

**Tech Stack:** Node.js v24, Express, dotenv, cors, Vanilla HTML5/CSS3/JavaScript (ES Modules), Web Speech API, Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`).

**Spec:** [docs/superpowers/specs/2026-09-26-english-learning-app-design.md](file:///f:/ENGLISH%20LEARN/docs/superpowers/specs/2026-09-26-english-learning-app-design.md)

## Global Constraints
- Target platform: Node.js v24+, Windows 11.
- No heavy frontend frameworks (React/Next.js) — keep runtime dependencies lightweight and instant to load.
- Dual API key support: Load from `.env` file or from user input in Web UI.
- All 20 topics must be fully functional from day one with curated sentences.
- 5 dedicated AI Engineer topics must be prominently featured.
- Audio synthesis must support 0.8x, 1.0x, 1.2x speeds.

## Review Focus
1. Gemini API rate limits or network failures -> Graceful error messages in UI, retry suggestion without losing the user's typed sentence.
2. Malformed JSON response from Gemini -> Robust JSON parsing fallback with regex extraction if markdown fences are returned.
3. Microphone permissions denied or unsupported browser -> Clear alert indicating Web Speech API permission required with fallback to keyboard typing.
4. Consecutive daily streak calculation -> Correct date arithmetic across days and months.
5. Offline / missing API key -> Prompt user to enter API key in UI settings dialog or add to `.env`.

---

### Task 1: Project Setup, Dependencies & Configuration Proxy

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `server.js`
- Test: `test/config.test.js`

**Interfaces:**
- Produces: `GET /api/config` -> `{ hasEnvKey: boolean, activeModel: string }`
- Produces: `POST /api/config` -> `{ success: boolean, message: string }`

- [ ] **Step 1: Write the failing test for configuration endpoints**

```javascript
// test/config.test.js
import assert from 'node:assert';
import test from 'node:test';

test('GET /api/config returns hasEnvKey boolean', async () => {
  const res = await fetch('http://localhost:3000/api/config');
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(typeof data.hasEnvKey, 'boolean');
  assert.strictEqual(typeof data.activeModel, 'string');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/config.test.js`  
Expected: FAIL (connection refused or cannot find server)

- [ ] **Step 3: Implement `package.json`, `.env.example`, and `server.js`**

Initialize `package.json` with dependencies (`express`, `dotenv`, `cors`), define `"type": "module"`, configure static file serving for `public/`, and implement `/api/config` GET/POST endpoints.

- [ ] **Step 4: Run test to verify it passes**

Start server and run: `node --test test/config.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json .env.example server.js test/config.test.js
git commit -m "feat: setup project dependencies and configuration endpoints"
```

---

### Task 2: Curated 20 Topics & Progress Persistence Engine

**Files:**
- Create: `data/topics.json`
- Create: `data/progress.json`
- Modify: `server.js` (add `/api/topics` and `/api/progress` endpoints)
- Test: `test/topics_progress.test.js`

**Interfaces:**
- Consumes: `server.js` Express app
- Produces: `GET /api/topics` -> Array of 20 topics with 10+ starter sentences each
- Produces: `GET /api/progress` -> `{ streak: number, lastDate: string, completedSentences: number, mistakes: [] }`
- Produces: `POST /api/progress` -> Updates progress and mistakes notebook

- [ ] **Step 1: Write the failing test for topics and progress APIs**

```javascript
// test/topics_progress.test.js
import assert from 'node:assert';
import test from 'node:test';

test('GET /api/topics returns 20 topics with AI Engineer topics included', async () => {
  const res = await fetch('http://localhost:3000/api/topics');
  assert.strictEqual(res.status, 200);
  const topics = await res.json();
  assert.strictEqual(topics.length, 20);
  assert.ok(topics.some(t => t.id === 'ai-standup'));
  assert.ok(topics.some(t => t.id === 'ai-models'));
});

test('POST /api/progress updates and saves progress', async () => {
  const payload = {
    date: '2026-09-26',
    completedIncrement: 1,
    score: 90,
    mistakeItem: null
  };
  const res = await fetch('http://localhost:3000/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert.strictEqual(res.status, 200);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/topics_progress.test.js`  
Expected: FAIL (404 or routes not defined)

- [ ] **Step 3: Create `data/topics.json` with 20 topics and implement endpoints in `server.js`**

Populate all 20 topics with curated sentences (5 AI engineering topics + 15 daily conversation topics) and implement file-based persistence for `data/progress.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/topics_progress.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add data/topics.json data/progress.json server.js test/topics_progress.test.js
git commit -m "feat: implement 20 topics data model and progress persistence"
```

---

### Task 3: Gemini Evaluation & Sentence Generation Engine

**Files:**
- Create: `src/gemini.js`
- Modify: `server.js` (wire `/api/evaluate` and `/api/generate-sentences`)
- Test: `test/gemini.test.js`

**Interfaces:**
- Produces: `evaluateTranslation({ apiKey, vietnamese, userEnglish, topicName }) -> EvaluationResult`
- Produces: `generateSentences({ apiKey, topicName, count }) -> Array<Sentence>`
- Produces: `POST /api/evaluate` -> `{ score, isCorrect, correctedSentence, naturalAlternative, grammarErrors, vocabularyTips, speakingFeedback, encouragement }`

- [ ] **Step 1: Write test with mock and schema validation**

```javascript
// test/gemini.test.js
import assert from 'node:assert';
import test from 'node:test';
import { parseGeminiResponse } from '../src/gemini.js';

test('parseGeminiResponse safely handles JSON wrapped in markdown fences', () => {
  const rawText = '```json\n{"score": 90, "isCorrect": true, "correctedSentence": "Hello", "grammarErrors": []}\n```';
  const parsed = parseGeminiResponse(rawText);
  assert.strictEqual(parsed.score, 90);
  assert.strictEqual(parsed.isCorrect, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/gemini.test.js`  
Expected: FAIL (module `src/gemini.js` not found)

- [ ] **Step 3: Implement `src/gemini.js` and mount endpoints in `server.js`**

Implement Gemini REST call with `gemini-2.5-flash` (or user-selected model), build detailed prompt with bilingual grammar analysis, extract and sanitize JSON output with fallback.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/gemini.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/gemini.js server.js test/gemini.test.js
git commit -m "feat: implement Gemini evaluation engine and prompt handling"
```

---

### Task 4: Web Speech Recognition & Audio Synthesis Module

**Files:**
- Create: `public/js/speech.js`
- Test: `test/speech_interface.test.js`

**Interfaces:**
- Produces: `initSpeechRecognition(onResult, onError, onEnd)`
- Produces: `speakText(text, rate = 1.0, lang = 'en-US')`
- Produces: `setSpeechRate(rate: 0.8 | 1.0 | 1.2)`

- [ ] **Step 1: Write unit test validating speech interface exports**

```javascript
// test/speech_interface.test.js
import assert from 'node:assert';
import test from 'node:test';
import { getAvailableRates, formatSpeechFeedback } from '../public/js/speech_utils.js';

test('speech utils supports 0.8, 1.0, 1.2 rates', () => {
  const rates = getAvailableRates();
  assert.deepStrictEqual(rates, [0.8, 1.0, 1.2]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/speech_interface.test.js`  
Expected: FAIL (`speech_utils.js` does not exist)

- [ ] **Step 3: Implement `public/js/speech_utils.js` and `public/js/speech.js`**

Implement speech recognition with microphone pulse states, voice synthesis with US English voice selection, and rate switching (`0.8x`, `1.0x`, `1.2x`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/speech_interface.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add public/js/speech.js public/js/speech_utils.js test/speech_interface.test.js
git commit -m "feat: implement speech recognition and text-to-speech engine"
```

---

### Task 5: Modern Glassmorphic Frontend & Learning Flow

**Files:**
- Create: `public/index.html`
- Create: `public/css/style.css`
- Create: `public/css/components.css`
- Create: `public/js/api.js`
- Create: `public/js/state.js`
- Create: `public/js/app.js`

**Interfaces:**
- State: `{ currentTopic, sentenceIndex, streak, todayCompleted, mistakes, apiKey }`
- Actions: `selectTopic(id)`, `checkAnswer()`, `recordVoice()`, `playAudio(speed)`, `showMistakes()`, `saveApiKey()`

- [ ] **Step 1: Build `index.html` with semantic structure and responsive layout**
  - Top navigation bar with Daily Streak counter, progress bar (e.g. `3/10 sentences`), Theme toggle, and Settings modal trigger.
  - Topic picker with badges for AI Engineer topics and daily topics.
  - Main practice card: Vietnamese situation, keyword hints, translation textarea, and Microphone button.
  - Evaluation result drawer: Score meter, Corrected sentence with speaker button, Native Alternative pill, Grammar error cards with Vietnamese explanations, Vocabulary highlight cards.
  - Mistakes Notebook modal to review and retry missed sentences.

- [ ] **Step 2: Implement styling in `public/css/style.css` and `public/css/components.css`**
  - CSS Custom properties for dark/light themes, sleek typography (Inter font), glassmorphism frosted glass backgrounds, audio pulse animation, responsive mobile/desktop layout.

- [ ] **Step 3: Implement client-side logic in `api.js`, `state.js`, and `app.js`**
  - Connect UI buttons with REST endpoints and speech module.
  - Keyboard shortcuts (`Enter` to submit, `Ctrl+Enter` for next sentence).
  - Streak increment logic and local cache synchronization.

- [ ] **Step 4: End-to-end integration verification**
  - Launch server via `node server.js`.
  - Verify page loads with 20 topics, selecting topic updates sentence card, mic button triggers recording, audio button speaks sentence, and check answer displays evaluation.

- [ ] **Step 5: Commit**

```bash
git add public/
git commit -m "feat: implement interactive glassmorphic UI and daily practice flow"
```

---

### Task 6: End-to-End Verification & User Documentation

**Files:**
- Create: `README.md`
- Create: `test/e2e_smoke.test.js`

- [ ] **Step 1: Write smoke test verifying complete flow**
  - Test server startup, topic loading, mock evaluation, and progress persistence.

- [ ] **Step 2: Run all test suites**
  - Run: `npm test`
  - Expected: ALL PASS

- [ ] **Step 3: Write comprehensive `README.md`**
  - Guide to get started (`npm install`, `npm start`), configuring Gemini API key, using Voice input and Audio Shadowing, and 3-month daily study routine.

- [ ] **Step 4: Commit**

```bash
git add README.md test/e2e_smoke.test.js
git commit -m "docs: add user documentation and e2e smoke verification"
```
