/**
 * Global App State Management
 */

const LOCAL_STORAGE_KEY_API = 'daily_english_gemini_api_key';
const LOCAL_STORAGE_KEY_THEME = 'daily_english_theme';
const LOCAL_STORAGE_KEY_MODEL = 'daily_english_model';
const LOCAL_STORAGE_KEY_TAB = 'daily_english_tab';
const LOCAL_STORAGE_KEY_PRACTICE_MODE = 'daily_english_practice_mode';

export const state = {
  // Navigation
  currentTab: localStorage.getItem(LOCAL_STORAGE_KEY_TAB) || 'roadmap', // 'roadmap', 'vocabulary', 'practice'
  
  // Practice Arena
  topics: [],
  currentTopicId: 'ai-standup',
  currentSentenceIndex: 0,
  streak: 0,
  todayCompleted: 0,
  totalCompleted: 0,
  mistakes: [],
  apiKey: localStorage.getItem(LOCAL_STORAGE_KEY_API) || '',
  theme: localStorage.getItem(LOCAL_STORAGE_KEY_THEME) || 'dark',
  activeModel: localStorage.getItem(LOCAL_STORAGE_KEY_MODEL) || 'gemini-3.8-flash',
  activeFilter: 'all', // 'all', 'tech', 'daily'
  currentEvaluation: null,
  practiceMode: localStorage.getItem(LOCAL_STORAGE_KEY_PRACTICE_MODE) || 'scramble', // 'scramble' (Ghép thẻ) or 'typing' (Gõ tự do)
  scrambleWords: [],
  scrambleSelected: [],

  // Vocabulary & SRS
  vocabulary: [],
  currentVocabIndex: 0,
  vocabFilter: 'all', // 'all', 'a1', 'a2', 'b1', 'b2', 'tech', 'due', 'mastered'
  vocabSearchQuery: '',
  vocabTablePage: 1,
  isFlashcardFlipped: false,

  // 90-Day Roadmap
  roadmap: {
    current_day: 1,
    completed_days: [],
    phases: [],
    days: []
  },
  selectedDay: 1,

  // 4 Advanced AI Features State
  roleplay: {
    scenarios: [],
    activeScenarioId: 'scenario-tech-interview',
    messages: [],
    isRecording: false,
    debriefReport: null,
    isLoading: false
  },
  story: {
    currentStory: null,
    isGenerating: false,
    isBilingual: true
  },
  pronunciation: {
    lastEvaluation: null,
    isEvaluating: false
  },
  assistant: {
    isOpen: false,
    messages: [],
    isLoading: false
  }
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

export function setModel(model) {
  state.activeModel = model.trim();
  localStorage.setItem(LOCAL_STORAGE_KEY_MODEL, state.activeModel);
}

export function setTab(tab) {
  state.currentTab = tab;
  localStorage.setItem(LOCAL_STORAGE_KEY_TAB, tab);
}

export function setPracticeMode(mode) {
  state.practiceMode = mode;
  localStorage.setItem(LOCAL_STORAGE_KEY_PRACTICE_MODE, mode);
}

export function getFilteredVocabList() {
  let list = state.vocabulary || [];
  const query = (state.vocabSearchQuery || '').toLowerCase().trim();
  if (query) {
    list = list.filter(v => 
      (v.word && v.word.toLowerCase().includes(query)) ||
      (v.meaning && v.meaning.toLowerCase().includes(query))
    );
  }

  const todayStr = getTodayDateString();
  const filter = state.vocabFilter;
  if (filter === 'due') {
    return list.filter(v => !v.next_review || v.next_review <= todayStr);
  } else if (filter === 'mastered') {
    return list.filter(v => v.srs_stage >= 4);
  } else if (filter === 'a1') {
    return list.filter(v => v.level && v.level.toUpperCase().startsWith('A1'));
  } else if (filter === 'a2') {
    return list.filter(v => v.level && v.level.toUpperCase().startsWith('A2'));
  } else if (filter === 'b1') {
    return list.filter(v => v.level && v.level.toUpperCase().startsWith('B1'));
  } else if (filter === 'b2') {
    return list.filter(v => v.level && v.level.toUpperCase().startsWith('B2'));
  } else if (filter === 'tech') {
    return list.filter(v => (v.level && v.level.toLowerCase().includes('tech')) || (v.level && v.level.toLowerCase().includes('ai')));
  }
  return list;
}



