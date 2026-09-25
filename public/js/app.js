import { state, getTodayDateString, getCurrentTopic, getCurrentSentence, setApiKey, setTheme } from './state.js';
import { fetchConfig, saveServerApiKey, fetchTopics, fetchProgress, saveProgress, evaluateTranslation, generateMoreSentences } from './api.js';
import { initSpeechRecognition, toggleRecording, speakText, setSpeechRate, getSpeechRate } from './speech.js';

// DOM Elements
const elements = {
  themeToggle: document.getElementById('theme-toggle'),
  settingsBtn: document.getElementById('settings-btn'),
  mistakesBtn: document.getElementById('mistakes-btn'),
  streakCount: document.getElementById('streak-count'),
  dailyProgressCount: document.getElementById('daily-progress-count'),
  
  topicCategories: document.getElementById('topic-categories'),
  topicsScroll: document.getElementById('topics-scroll'),
  btnGenerateMore: document.getElementById('btn-generate-more'),
  
  currentTopicBadge: document.getElementById('current-topic-badge'),
  sentenceCounter: document.getElementById('sentence-counter'),
  situationVietnamese: document.getElementById('situation-vietnamese'),
  situationContext: document.getElementById('situation-context'),
  situationHintWrap: document.getElementById('situation-hint-wrap'),
  situationHint: document.getElementById('situation-hint'),
  btnToggleHint: document.getElementById('btn-toggle-hint'),
  
  englishInput: document.getElementById('english-input'),
  micBtn: document.getElementById('mic-btn'),
  voiceStatusBar: document.getElementById('voice-status-bar'),
  btnCheck: document.getElementById('btn-check'),
  btnSkip: document.getElementById('btn-skip'),
  
  feedbackContainer: document.getElementById('feedback-container'),
  scoreCircle: document.getElementById('score-circle'),
  verdictTitle: document.getElementById('verdict-title'),
  verdictSub: document.getElementById('verdict-sub'),
  correctedText: document.getElementById('corrected-text'),
  btnSpeakCorrected: document.getElementById('btn-speak-corrected'),
  speedBtns: document.querySelectorAll('.speed-btn'),
  nativeAltText: document.getElementById('native-alt-text'),
  grammarBreakdown: document.getElementById('grammar-breakdown'),
  vocabSpotlight: document.getElementById('vocab-spotlight'),
  speakingAdvice: document.getElementById('speaking-advice'),
  encouragementText: document.getElementById('encouragement-text'),
  btnNextSentence: document.getElementById('btn-next-sentence'),
  btnRetrySentence: document.getElementById('btn-retry-sentence'),

  // Modals
  settingsModal: document.getElementById('settings-modal'),
  settingsClose: document.getElementById('settings-close'),
  settingsSave: document.getElementById('settings-save'),
  apiKeyInput: document.getElementById('api-key-input'),
  apiStatusNotice: document.getElementById('api-status-notice'),

  mistakesModal: document.getElementById('mistakes-modal'),
  mistakesClose: document.getElementById('mistakes-close'),
  mistakesList: document.getElementById('mistakes-list'),
  mistakesEmpty: document.getElementById('mistakes-empty')
};

// Initialize App
async function initApp() {
  setTheme(state.theme);
  setupEventListeners();
  setupSpeechEngine();

  try {
    // Load config & check API key
    const config = await fetchConfig();
    updateApiStatusUI(config.has_api_key);

    // Load topics
    state.topics = await fetchTopics();
    renderTopics();

    // Load progress
    const progress = await fetchProgress();
    state.streak = progress.streak || 0;
    state.todayCompleted = progress.today_completed || 0;
    state.totalCompleted = progress.total_completed || 0;
    state.mistakes = progress.mistakes || [];
    updateHeaderStats();

    // Render initial sentence
    renderCurrentSentence();
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

function setupSpeechEngine() {
  initSpeechRecognition({
    onStart: () => {
      elements.micBtn.classList.add('recording');
      elements.voiceStatusBar.classList.add('active');
    },
    onResult: (transcript, isFinal) => {
      elements.englishInput.value = transcript;
    },
    onError: (err) => {
      console.warn('Speech recognition error:', err);
      elements.micBtn.classList.remove('recording');
      elements.voiceStatusBar.classList.remove('active');
    },
    onEnd: () => {
      elements.micBtn.classList.remove('recording');
      elements.voiceStatusBar.classList.remove('active');
    }
  });
}

function updateHeaderStats() {
  elements.streakCount.textContent = `${state.streak} Ngày`;
  elements.dailyProgressCount.textContent = `${state.todayCompleted}/10 Câu`;
}

function updateApiStatusUI(hasKey) {
  if (hasKey) {
    elements.apiStatusNotice.textContent = '🟢 Gemini API Key đã được kích hoạt thành công.';
    elements.apiStatusNotice.style.color = '#34d399';
  } else {
    elements.apiStatusNotice.textContent = '⚠️ Chưa có API Key. Bấm vào đây để cài đặt hoặc thêm vào file .env';
    elements.apiStatusNotice.style.color = '#fbbf24';
  }
}

function renderTopics() {
  elements.topicsScroll.innerHTML = '';
  
  const filtered = state.topics.filter(topic => {
    if (state.activeFilter === 'all') return true;
    return topic.category === state.activeFilter;
  });

  filtered.forEach(topic => {
    const chip = document.createElement('div');
    chip.className = `topic-chip ${topic.category === 'tech' ? 'tech-badge' : ''} ${topic.id === state.currentTopicId ? 'active' : ''}`;
    chip.innerHTML = `
      <span class="chip-icon">${topic.icon}</span>
      <span class="chip-name">${topic.name}</span>
    `;
    chip.addEventListener('click', () => {
      selectTopic(topic.id);
    });
    elements.topicsScroll.appendChild(chip);
  });
}

function selectTopic(topicId) {
  state.currentTopicId = topicId;
  state.currentSentenceIndex = 0;
  renderTopics();
  renderCurrentSentence();
  hideFeedback();
}

function renderCurrentSentence() {
  const topic = getCurrentTopic();
  const sentence = getCurrentSentence();
  if (!topic || !sentence) return;

  elements.currentTopicBadge.innerHTML = `${topic.icon} ${topic.name}`;
  elements.sentenceCounter.textContent = `Câu ${state.currentSentenceIndex + 1} / ${topic.sentences.length}`;
  elements.situationVietnamese.textContent = sentence.vietnamese;
  elements.situationContext.textContent = sentence.context || topic.description;
  
  if (sentence.hint) {
    elements.situationHintWrap.style.display = 'none'; // hidden by default until clicked
    elements.situationHint.textContent = sentence.hint;
    elements.btnToggleHint.style.display = 'inline-flex';
  } else {
    elements.situationHintWrap.style.display = 'none';
    elements.btnToggleHint.style.display = 'none';
  }

  elements.englishInput.value = '';
  elements.englishInput.focus();
}

async function handleCheckAnswer() {
  const sentence = getCurrentSentence();
  const topic = getCurrentTopic();
  const userEnglish = elements.englishInput.value.trim();

  if (!userEnglish) {
    elements.englishInput.focus();
    return;
  }

  // Set loading state
  elements.btnCheck.disabled = true;
  elements.btnCheck.innerHTML = `
    <span class="soundwave-bar" style="height:12px"></span>
    <span>Đang phân tích với AI...</span>
  `;

  try {
    const result = await evaluateTranslation({
      topicId: topic.id,
      vietnamese: sentence.vietnamese,
      userEnglish,
      isVoice: elements.micBtn.classList.contains('recording'),
      customApiKey: state.apiKey || null
    });

    state.currentEvaluation = result;
    renderFeedback(result, sentence, userEnglish);

    // Save progress
    const today = getTodayDateString();
    let mistakeItem = null;
    if (result.score < 75 || (result.grammar_errors && result.grammar_errors.length > 0)) {
      mistakeItem = {
        id: `mistake-${Date.now()}`,
        topic_id: topic.id,
        vietnamese: sentence.vietnamese,
        user_english: userEnglish,
        corrected_sentence: result.corrected_sentence,
        explanation: result.grammar_errors.map(e => `${e.original} ➔ ${e.fix}: ${e.explanation}`).join(' | '),
        timestamp: new Date().toISOString()
      };
    }

    const progRes = await saveProgress({
      date: today,
      completedIncrement: 1,
      score: result.score,
      mistakeItem
    });

    if (progRes.progress) {
      state.streak = progRes.progress.streak;
      state.todayCompleted = progRes.progress.today_completed;
      state.mistakes = progRes.progress.mistakes || [];
      updateHeaderStats();
    }

  } catch (error) {
    alert(`Lỗi: ${error.message}`);
  } finally {
    elements.btnCheck.disabled = false;
    elements.btnCheck.innerHTML = `<span>Kiểm tra đáp án</span><span>➔</span>`;
  }
}

function renderFeedback(evalResult, sentence, userEnglish) {
  elements.feedbackContainer.classList.add('visible');

  // Score circle styling
  const score = evalResult.score;
  elements.scoreCircle.textContent = score;
  elements.scoreCircle.className = 'score-circle';
  if (score >= 85) {
    elements.scoreCircle.classList.add('score-excellent');
    elements.verdictTitle.textContent = 'Xuất sắc! Chuẩn người bản xứ';
    elements.verdictTitle.style.color = '#34d399';
    elements.verdictSub.textContent = 'Câu văn tự nhiên, ngữ pháp chính xác.';
  } else if (score >= 65) {
    elements.scoreCircle.classList.add('score-good');
    elements.verdictTitle.textContent = 'Khá tốt! Cần trau chuốt thêm';
    elements.verdictTitle.style.color = '#fbbf24';
    elements.verdictSub.textContent = 'Ý nghĩa đúng nhưng cần dùng từ tự nhiên hơn.';
  } else {
    elements.scoreCircle.classList.add('score-needs-work');
    elements.verdictTitle.textContent = 'Cần luyện tập thêm';
    elements.verdictTitle.style.color = '#fb7185';
    elements.verdictSub.textContent = 'Có một số lỗi ngữ pháp cần lưu ý bên dưới.';
  }

  // Model sentence
  elements.correctedText.textContent = evalResult.corrected_sentence;
  elements.nativeAltText.textContent = evalResult.natural_alternative || evalResult.corrected_sentence;

  // Grammar errors
  elements.grammarBreakdown.innerHTML = '';
  if (evalResult.grammar_errors && evalResult.grammar_errors.length > 0) {
    evalResult.grammar_errors.forEach(err => {
      const errCard = document.createElement('div');
      errCard.className = 'error-card';
      errCard.innerHTML = `
        <div class="error-diff">
          <span class="error-wrong">${escapeHtml(err.original)}</span>
          <span class="error-arrow">➔</span>
          <span class="error-right">${escapeHtml(err.fix)}</span>
        </div>
        <p class="error-explanation">${escapeHtml(err.explanation)}</p>
      `;
      elements.grammarBreakdown.appendChild(errCard);
    });
  } else {
    elements.grammarBreakdown.innerHTML = `
      <div style="color: #34d399; font-size: 0.95rem; font-weight: 600;">
        ✨ Không phát hiện lỗi ngữ pháp nào! Bạn diễn đạt rất chuẩn.
      </div>
    `;
  }

  // Vocabulary spotlight
  elements.vocabSpotlight.innerHTML = '';
  if (evalResult.vocabulary_tips && evalResult.vocabulary_tips.length > 0) {
    evalResult.vocabulary_tips.forEach(v => {
      const vCard = document.createElement('div');
      vCard.className = 'spotlight-card';
      vCard.innerHTML = `
        <div class="spotlight-title">Gợi ý từ vựng / Collocation</div>
        <div class="vocab-term">${escapeHtml(v.term)} <span class="vocab-ipa">${escapeHtml(v.ipa || '')}</span></div>
        <div class="vocab-meaning">${escapeHtml(v.meaning)}</div>
      `;
      elements.vocabSpotlight.appendChild(vCard);
    });
  }

  // Speaking advice
  elements.speakingAdvice.textContent = evalResult.speaking_feedback || 'Nhấn nút Loa để nghe mẫu và nhại lại (Shadowing) 3 lần để nhuần nhuyễn phản xạ.';

  // Encouragement
  elements.encouragementText.textContent = evalResult.encouragement || 'Cố gắng duy trì thói quen học mỗi ngày nhé!';

  // Scroll smoothly to feedback
  elements.feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFeedback() {
  elements.feedbackContainer.classList.remove('visible');
}

function goToNextSentence() {
  const topic = getCurrentTopic();
  if (!topic) return;

  if (state.currentSentenceIndex < topic.sentences.length - 1) {
    state.currentSentenceIndex++;
  } else {
    // Loop back or prompt
    state.currentSentenceIndex = 0;
  }

  renderCurrentSentence();
  hideFeedback();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setupEventListeners() {
  // Theme Toggle
  elements.themeToggle.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });

  // Category filter tabs
  elements.topicCategories.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeFilter = btn.dataset.filter;
    renderTopics();
  });

  // Toggle Hint
  elements.btnToggleHint.addEventListener('click', () => {
    const isHidden = elements.situationHintWrap.style.display === 'none';
    elements.situationHintWrap.style.display = isHidden ? 'flex' : 'none';
  });

  // Microphone toggle
  elements.micBtn.addEventListener('click', () => {
    toggleRecording();
  });

  // Check answer
  elements.btnCheck.addEventListener('click', handleCheckAnswer);

  // Skip sentence
  elements.btnSkip.addEventListener('click', goToNextSentence);

  // Next & Retry
  elements.btnNextSentence.addEventListener('click', goToNextSentence);
  elements.btnRetrySentence.addEventListener('click', () => {
    hideFeedback();
    elements.englishInput.focus();
  });

  // Audio Playback with speed buttons
  elements.btnSpeakCorrected.addEventListener('click', () => {
    const text = elements.correctedText.textContent;
    if (text) speakText(text);
  });

  elements.speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const rate = parseFloat(btn.dataset.speed);
      setSpeechRate(rate);
      const text = elements.correctedText.textContent;
      if (text) speakText(text, rate);
    });
  });

  // Generate more sentences
  elements.btnGenerateMore.addEventListener('click', async () => {
    const topic = getCurrentTopic();
    if (!topic) return;
    elements.btnGenerateMore.disabled = true;
    elements.btnGenerateMore.textContent = '⏳ Đang tạo câu...';

    try {
      const res = await generateMoreSentences({
        topicId: topic.id,
        topicName: topic.name,
        count: 5,
        customApiKey: state.apiKey || null
      });

      if (res.sentences && res.sentences.length > 0) {
        topic.sentences.push(...res.sentences);
        renderCurrentSentence();
        alert(`Đã tạo thành công ${res.sentences.length} câu mới cho chủ đề "${topic.name}"!`);
      }
    } catch (e) {
      alert(`Không thể tạo câu mới: ${e.message}`);
    } finally {
      elements.btnGenerateMore.disabled = false;
      elements.btnGenerateMore.textContent = '✨ Tạo thêm câu mới với AI';
    }
  });

  // Settings Modal
  elements.settingsBtn.addEventListener('click', () => {
    elements.apiKeyInput.value = state.apiKey;
    elements.settingsModal.classList.add('active');
  });

  elements.settingsClose.addEventListener('click', () => {
    elements.settingsModal.classList.remove('active');
  });

  elements.settingsSave.addEventListener('click', async () => {
    const key = elements.apiKeyInput.value.trim();
    setApiKey(key);
    if (key) {
      await saveServerApiKey(key);
      updateApiStatusUI(true);
    }
    elements.settingsModal.classList.remove('active');
  });

  // Mistakes Modal
  elements.mistakesBtn.addEventListener('click', () => {
    renderMistakesList();
    elements.mistakesModal.classList.add('active');
  });

  elements.mistakesClose.addEventListener('click', () => {
    elements.mistakesModal.classList.remove('active');
  });

  // Keyboard Shortcuts: Enter submits, Ctrl+Enter goes next
  elements.englishInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCheckAnswer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      goToNextSentence();
    }
  });
}

function renderMistakesList() {
  elements.mistakesList.innerHTML = '';
  if (!state.mistakes || state.mistakes.length === 0) {
    elements.mistakesEmpty.style.display = 'block';
    return;
  }
  elements.mistakesEmpty.style.display = 'none';

  state.mistakes.forEach(m => {
    const item = document.createElement('div');
    item.className = 'mistake-item';
    item.innerHTML = `
      <div class="mistake-vn">${escapeHtml(m.vietnamese)}</div>
      <div class="mistake-user">Câu của bạn: ${escapeHtml(m.user_english)}</div>
      <div class="mistake-fix">Sửa lại: ${escapeHtml(m.corrected_sentence)}</div>
      <div class="mistake-expl">${escapeHtml(m.explanation)}</div>
    `;
    elements.mistakesList.appendChild(item);
  });
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
