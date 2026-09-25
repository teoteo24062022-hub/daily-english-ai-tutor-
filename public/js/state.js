/**
 * Global App State Management
 */

const LOCAL_STORAGE_KEY_API = 'daily_english_gemini_api_key';
const LOCAL_STORAGE_KEY_THEME = 'daily_english_theme';

export const state = {
  topics: [],
  currentTopicId: 'ai-standup',
  currentSentenceIndex: 0,
  streak: 0,
  todayCompleted: 0,
  totalCompleted: 0,
  mistakes: [],
  apiKey: localStorage.getItem(LOCAL_STORAGE_KEY_API) || '',
  theme: localStorage.getItem(LOCAL_STORAGE_KEY_THEME) || 'dark',
  activeFilter: 'all', // 'all', 'tech', 'daily'
  currentEvaluation: null
};

export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTopic() {
  return state.topics.find(t => t.id === state.currentTopicId) || state.topics[0] || null;
}

export function getCurrentSentence() {
  const topic = getCurrentTopic();
  if (!topic || !topic.sentences || topic.sentences.length === 0) return null;
  const index = Math.min(state.currentSentenceIndex, topic.sentences.length - 1);
  return topic.sentences[index];
}

export function setApiKey(key) {
  state.apiKey = key.trim();
  localStorage.setItem(LOCAL_STORAGE_KEY_API, state.apiKey);
}

export function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
  document.documentElement.setAttribute('data-theme', theme);
}
