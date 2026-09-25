/**
 * API Client for Daily English AI Tutor (FastAPI backend)
 */
import { state } from './state.js';

function getAuthHeaders(customHeaders = {}) {
  const headers = { ...customHeaders };
  if (state.auth && state.auth.token) {
    headers['Authorization'] = `Bearer ${state.auth.token}`;
  }
  return headers;
}

// ========================================================
// AUTHENTICATION API CALLERS
// ========================================================

export async function registerAccount(email, username, password) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Đăng ký tài khoản thất bại');
  }
  return data;
}

export async function loginAccount(emailOrUsername, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_or_username: emailOrUsername, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Đăng nhập thất bại');
  }
  return data;
}

export async function forgotPassword(email, recoveryPin, newPassword) {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      recovery_pin: recoveryPin,
      new_password: newPassword
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Đặt lại mật khẩu thất bại');
  }
  return data;
}

export async function fetchMe() {
  const res = await fetch('/api/auth/me', {
    headers: getAuthHeaders()
  });
  if (!res.ok) return { authenticated: false, user: null };
  return res.json();
}

export async function logoutAccount() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

// ========================================================
// CORE & SETTINGS API CALLERS
// ========================================================

export async function fetchConfig() {
  const res = await fetch('/api/config', {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function saveServerApiKey(apiKey, model = null) {
  const payload = {};
  if (apiKey) payload.api_key = apiKey;
  if (model) payload.model = model;
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchTopics() {
  const res = await fetch('/api/topics', {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchProgress() {
  const res = await fetch('/api/progress', {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function saveProgress({ date, completedIncrement = 1, score = 100, mistakeItem = null }) {
  const res = await fetch('/api/progress', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      date,
      completed_increment: completedIncrement,
      score,
      mistake_item: mistakeItem
    })
  });
  return res.json();
}

export async function evaluateTranslation({ topicId, vietnamese, userEnglish, isVoice = false, customApiKey = null }) {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      topic_id: topicId,
      vietnamese,
      user_english: userEnglish,
      is_voice: isVoice,
      custom_api_key: customApiKey
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Network Error' }));
    throw new Error(errorData.detail || 'Không thể kết nối đến AI');
  }

  return res.json();
}

export async function generateMoreSentences({ topicId, topicName, count = 5, customApiKey = null }) {
  const res = await fetch('/api/generate-sentences', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      topic_id: topicId,
      topic_name: topicName,
      count,
      custom_api_key: customApiKey
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Network Error' }));
    throw new Error(errorData.detail || 'Không thể tạo thêm câu');
  }

  return res.json();
}

export async function quickCheckGrammar({ text, topicName = 'General English', customApiKey = null }) {
  const res = await fetch('/api/quick-check', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      text,
      topic_name: topicName,
      custom_api_key: customApiKey
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Network Error' }));
    throw new Error(errorData.detail || 'Không thể kiểm tra nhanh');
  }

  return res.json();
}

export async function createCustomTopic({ topicName, category = 'tech', count = 10, customApiKey = null }) {
  const res = await fetch('/api/topics/create', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      topic_name: topicName,
      category,
      count,
      custom_api_key: customApiKey
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Network Error' }));
    throw new Error(errorData.detail || 'Không thể tạo chủ đề');
  }

  return res.json();
}

export async function fetchVocabulary() {
  const res = await fetch('/api/vocabulary', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Không thể tải kho từ vựng');
  return res.json();
}

export async function reviewVocabulary(vocabId, grade) {
  const res = await fetch('/api/vocabulary/review', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ vocab_id: vocabId, grade })
  });
  if (!res.ok) throw new Error('Không thể cập nhật tiến độ ôn tập');
  return res.json();
}

export async function aiGenerateVocab(word, contextHint = null, customApiKey = null) {
  const res = await fetch('/api/vocabulary/ai-generate', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      word,
      context_hint: contextHint,
      custom_api_key: customApiKey
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Lỗi phân tích từ vựng' }));
    throw new Error(errorData.detail || 'Không thể phân tích từ vựng với AI');
  }
  return res.json();
}

export async function addCustomWord(wordData) {
  const res = await fetch('/api/vocabulary/add', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(wordData)
  });
  if (!res.ok) throw new Error('Không thể lưu từ vựng');
  return res.json();
}

export async function fetchRoadmap() {
  const res = await fetch('/api/roadmap', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Không thể tải lộ trình 90 ngày');
  return res.json();
}

export async function completeRoadmapDay(day) {
  const res = await fetch('/api/roadmap/complete-day', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ day })
  });
  if (!res.ok) throw new Error('Không thể cập nhật ngày học');
  return res.json();
}

// ========================================================
// 4 ADVANCED AI FEATURES API CALLERS
// ========================================================

export async function fetchRoleplayScenarios() {
  const res = await fetch('/api/roleplay/scenarios', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Không thể tải danh sách kịch bản hội thoại');
  return res.json();
}

export async function sendRoleplayChat(scenarioId, messages, userInput, customApiKey = "") {
  const res = await fetch('/api/roleplay/chat', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      scenario_id: scenarioId,
      messages: messages,
      user_input: userInput,
      custom_api_key: customApiKey
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Lỗi gửi tin nhắn hội thoại' }));
    throw new Error(err.detail || 'Không thể nhận phản hồi từ AI');
  }
  return res.json();
}

export async function fetchRoleplayDebrief(scenarioId, messages, customApiKey = "") {
  const res = await fetch('/api/roleplay/debrief', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      scenario_id: scenarioId,
      messages: messages,
      custom_api_key: customApiKey
    })
  });
  if (!res.ok) throw new Error('Không thể tạo báo cáo đánh giá buổi hội thoại');
  return res.json();
}

export async function generateVocabStory(words, theme = "tech_work", customApiKey = "") {
  const res = await fetch('/api/story/generate', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      words: words,
      theme: theme,
      custom_api_key: customApiKey
    })
  });
  if (!res.ok) throw new Error('Không thể sáng tác truyện từ vựng');
  return res.json();
}

export async function evaluatePronunciation(targetSentence, spokenText) {
  const res = await fetch('/api/pronunciation/evaluate', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      target_sentence: targetSentence,
      spoken_text: spokenText
    })
  });
  if (!res.ok) throw new Error('Không thể chấm điểm phát âm');
  return res.json();
}

export async function askAiAssistant(questionOrOpts, selectedText = "", context = "", customApiKey = "") {
  let question = "";
  let selText = selectedText;
  let ctx = context;
  let apiKey = customApiKey;

  if (typeof questionOrOpts === 'object' && questionOrOpts !== null) {
    question = questionOrOpts.question || "";
    selText = questionOrOpts.selectedText || questionOrOpts.selected_text || "";
    ctx = questionOrOpts.context || "";
    apiKey = questionOrOpts.customApiKey || questionOrOpts.custom_api_key || "";
  } else {
    question = questionOrOpts || "";
  }

  const res = await fetch('/api/assistant/ask', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      question: question,
      selected_text: selText,
      context: ctx,
      custom_api_key: apiKey
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Lỗi trợ lý AI' }));
    throw new Error(err.detail || 'Không thể gửi câu hỏi cho trợ lý AI');
  }
  return res.json();
}
