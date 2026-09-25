import { 
  state, getTodayDateString, getCurrentTopic, getCurrentSentence, 
  setApiKey, setTheme, setModel, setTab, setPracticeMode, getFilteredVocabList,
  setAuthUser, clearAuthUser
} from './state.js';
import { 
  fetchConfig, saveServerApiKey, fetchTopics, fetchProgress, saveProgress, 
  evaluateTranslation, generateMoreSentences, quickCheckGrammar, createCustomTopic,
  fetchVocabulary, reviewVocabulary, aiGenerateVocab, addCustomWord, fetchRoadmap, completeRoadmapDay,
  fetchRoleplayScenarios, sendRoleplayChat, fetchRoleplayDebrief, generateVocabStory, evaluatePronunciation, askAiAssistant,
  registerAccount, loginAccount, forgotPassword, fetchMe, logoutAccount
} from './api.js';
import { initSpeechRecognition, toggleRecording, speakText, setSpeechRate, getSpeechRate, createVoiceRecognizer } from './speech.js';

// DOM Elements
const elements = {
  // Navigation Tabs
  tabBtnRoadmap: document.getElementById('tab-btn-roadmap'),
  tabBtnVocabulary: document.getElementById('tab-btn-vocabulary'),
  tabBtnPractice: document.getElementById('tab-btn-practice'),
  tabBtnRoleplay: document.getElementById('tab-btn-roleplay'),
  viewRoadmap: document.getElementById('view-roadmap'),
  viewVocabulary: document.getElementById('view-vocabulary'),
  viewPractice: document.getElementById('view-practice'),
  viewRoleplay: document.getElementById('view-roleplay'),
  navRoadmapBadge: document.getElementById('nav-roadmap-badge'),
  navVocabBadge: document.getElementById('nav-vocab-badge'),
  navPracticeBadge: document.getElementById('nav-practice-badge'),
  navRoleplayBadge: document.getElementById('nav-roleplay-badge'),

  // Header & Global Stats
  themeToggle: document.getElementById('theme-toggle'),
  settingsBtn: document.getElementById('settings-btn'),
  mistakesBtn: document.getElementById('mistakes-btn'),
  streakCount: document.getElementById('streak-count'),
  dailyProgressCount: document.getElementById('daily-progress-count'),

  // ==========================================
  // VIEW 1: ROADMAP ELEMENTS
  // ==========================================
  heroPhaseTag: document.getElementById('hero-phase-tag'),
  heroTitle: document.getElementById('hero-title'),
  roadmapPercent: document.getElementById('roadmap-percent'),
  roadmapBarFill: document.getElementById('roadmap-bar-fill'),
  questVocab: document.getElementById('quest-vocab'),
  questLesson: document.getElementById('quest-lesson'),
  questPractice: document.getElementById('quest-practice'),
  phasesGrid: document.getElementById('phases-grid'),
  lessonDayBadge: document.getElementById('lesson-day-badge'),
  lessonTitle: document.getElementById('lesson-title'),
  lessonGoal: document.getElementById('lesson-goal'),
  lessonTheory: document.getElementById('lesson-theory'),
  coreVocabChips: document.getElementById('core-vocab-chips'),
  lessonSampleSentence: document.getElementById('lesson-sample-sentence'),
  btnSpeakLessonSample: document.getElementById('btn-speak-lesson-sample'),
  lessonPracticeTip: document.getElementById('lesson-practice-tip'),
  btnCompleteDay: document.getElementById('btn-complete-day'),
  btnPracticeNow: document.getElementById('btn-practice-now'),
  daysScroll: document.getElementById('days-scroll'),
  ipaGridContainer: document.getElementById('ipa-grid-container'),
  ipaPreviewBox: document.getElementById('ipa-preview-box'),
  ipaCurrentSound: document.getElementById('ipa-current-sound'),
  ipaCurrentWord: document.getElementById('ipa-current-word'),
  btnReplayIpa: document.getElementById('btn-replay-ipa'),

  // ==========================================
  // VIEW 2: VOCABULARY & FLASHCARDS ELEMENTS
  // ==========================================
  countAll: document.getElementById('count-all'),
  countA1: document.getElementById('count-a1'),
  countA2: document.getElementById('count-a2'),
  countB1: document.getElementById('count-b1'),
  countB2: document.getElementById('count-b2'),
  countDue: document.getElementById('count-due'),
  countMastered: document.getElementById('count-mastered'),
  countTech: document.getElementById('count-tech'),
  vocabSearchInput: document.getElementById('vocab-search-input'),
  btnOpenAddVocab: document.getElementById('btn-open-add-vocab'),
  btnOpenVocabQuiz: document.getElementById('btn-open-vocab-quiz'),
  flashcardCounter: document.getElementById('flashcard-counter'),
  flashcardSrsStatus: document.getElementById('flashcard-srs-status'),
  flashcardContainer: document.getElementById('flashcard-container'),
  flashcardInner: document.getElementById('flashcard-inner'),
  fcLevel: document.getElementById('fc-level'),
  fcPos: document.getElementById('fc-pos'),
  fcWord: document.getElementById('fc-word'),
  fcIpa: document.getElementById('fc-ipa'),
  btnSpeakVocab: document.getElementById('btn-speak-vocab'),
  btnFlipCard: document.getElementById('btn-flip-card'),
  btnFlipBack: document.getElementById('btn-flip-back'),
  btnCardFrontAgain: document.getElementById('btn-card-front-again'),
  btnCardFrontKnown: document.getElementById('btn-card-front-known'),
  btnCardBackAgain: document.getElementById('btn-card-back-again'),
  btnCardBackKnown: document.getElementById('btn-card-back-known'),
  flashcardSaveToast: document.getElementById('flashcard-save-toast'),
  fcMeaning: document.getElementById('fc-meaning'),
  fcExampleEn: document.getElementById('fc-example-en'),
  fcExampleVi: document.getElementById('fc-example-vi'),
  fcMnemonicBox: document.getElementById('fc-mnemonic-box'),
  fcMnemonic: document.getElementById('fc-mnemonic'),
  btnVocabPrev: document.getElementById('btn-vocab-prev'),
  btnVocabNext: document.getElementById('btn-vocab-next'),
  btnVocabRandom: document.getElementById('btn-vocab-random'),
  vocabPageIndicator: document.getElementById('vocab-page-indicator'),
  vocabTableBody: document.getElementById('vocab-table-body'),
  tableTotalCount: document.getElementById('table-total-count'),
  btnTablePrev: document.getElementById('btn-table-prev'),
  btnTableNext: document.getElementById('btn-table-next'),
  tablePageInfo: document.getElementById('table-page-info'),

  // ==========================================
  // VIEW 4: AI ROLEPLAY ARENA ELEMENTS
  // ==========================================
  roleplayScenarioSelect: document.getElementById('roleplay-scenario-select'),
  scCardIcon: document.getElementById('sc-card-icon'),
  scCardBadge: document.getElementById('sc-card-badge'),
  scCardRole: document.getElementById('sc-card-role'),
  scCardTitle: document.getElementById('sc-card-title'),
  scCardDesc: document.getElementById('sc-card-desc'),
  roleplayMessagesStream: document.getElementById('roleplay-messages-stream'),
  btnRoleplayVoice: document.getElementById('btn-roleplay-voice'),
  roleplayTextInput: document.getElementById('roleplay-text-input'),
  btnRoleplaySend: document.getElementById('btn-roleplay-send'),
  btnRoleplayFinish: document.getElementById('btn-roleplay-finish'),
  roleplayDebriefModal: document.getElementById('roleplay-debrief-modal'),
  roleplayDebriefClose: document.getElementById('roleplay-debrief-close'),
  btnCloseDebrief: document.getElementById('btn-close-debrief'),
  btnRestartRoleplay: document.getElementById('btn-restart-roleplay'),
  debriefScore: document.getElementById('debrief-score'),
  debriefLevel: document.getElementById('debrief-level'),
  debriefSummary: document.getElementById('debrief-summary'),
  debriefCorrectionsList: document.getElementById('debrief-corrections-list'),
  debriefUpgradesList: document.getElementById('debrief-upgrades-list'),
  debriefTechTags: document.getElementById('debrief-tech-tags'),

  // ==========================================
  // VIEW 3: PRACTICE ARENA ELEMENTS
  // ==========================================
  topicCategories: document.getElementById('topic-categories'),
  topicsScroll: document.getElementById('topics-scroll'),
  btnGenerateMore: document.getElementById('btn-generate-more'),
  btnCreateTopicModal: document.getElementById('btn-create-topic-modal'),
  currentTopicBadge: document.getElementById('current-topic-badge'),
  sentenceCounter: document.getElementById('sentence-counter'),
  situationVietnamese: document.getElementById('situation-vietnamese'),
  situationContext: document.getElementById('situation-context'),
  situationHintWrap: document.getElementById('situation-hint-wrap'),
  situationHint: document.getElementById('situation-hint'),
  btnToggleHint: document.getElementById('btn-toggle-hint'),
  
  // Beginner Mode & Word Scramble
  btnModeScramble: document.getElementById('btn-mode-scramble'),
  btnModeTyping: document.getElementById('btn-mode-typing'),
  scrambleBox: document.getElementById('scramble-box'),
  scrambleChips: document.getElementById('scramble-chips'),
  btnScrambleReset: document.getElementById('btn-scramble-reset'),

  englishInput: document.getElementById('english-input'),
  micBtn: document.getElementById('mic-btn'),
  voiceStatusBar: document.getElementById('voice-status-bar'),
  btnCheck: document.getElementById('btn-check'),
  btnSkip: document.getElementById('btn-skip'),
  
  // Grammarly Assistant elements
  grammarlyBar: document.getElementById('grammarly-bar'),
  grammarlyStatusText: document.getElementById('grammarly-status-text'),
  grammarlyStatusIcon: document.getElementById('grammarly-status-icon'),
  mCorrectness: document.getElementById('m-correctness'),
  mClarity: document.getElementById('m-clarity'),
  mEngagement: document.getElementById('m-engagement'),
  mDelivery: document.getElementById('m-delivery'),
  suggestionsContainer: document.getElementById('suggestions-container'),

  // Feedback Drawer
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

  // ==========================================
  // MODALS
  // ==========================================
  settingsModal: document.getElementById('settings-modal'),
  settingsClose: document.getElementById('settings-close'),
  settingsSave: document.getElementById('settings-save'),
  apiKeyInput: document.getElementById('api-key-input'),
  apiStatusNotice: document.getElementById('api-status-notice'),
  modelSelect: document.getElementById('model-select'),

  mistakesModal: document.getElementById('mistakes-modal'),
  mistakesClose: document.getElementById('mistakes-close'),
  mistakesFooterClose: document.getElementById('mistakes-footer-close'),
  mistakesList: document.getElementById('mistakes-list'),
  mistakesEmpty: document.getElementById('mistakes-empty'),

  createTopicModal: document.getElementById('create-topic-modal'),
  createTopicClose: document.getElementById('create-topic-close'),
  createTopicCancel: document.getElementById('create-topic-cancel'),
  btnSubmitCreateTopic: document.getElementById('btn-submit-create-topic'),
  newTopicName: document.getElementById('new-topic-name'),
  createTopicStatus: document.getElementById('create-topic-status'),

  addVocabModal: document.getElementById('add-vocab-modal'),
  addVocabClose: document.getElementById('add-vocab-close'),
  addVocabCancel: document.getElementById('add-vocab-cancel'),
  inputVocabWord: document.getElementById('input-vocab-word'),
  btnAiAnalyzeWord: document.getElementById('btn-ai-analyze-word'),
  aiVocabStatus: document.getElementById('ai-vocab-status'),
  inputVocabIpa: document.getElementById('input-vocab-ipa'),
  inputVocabMeaning: document.getElementById('input-vocab-meaning'),
  inputVocabExampleEn: document.getElementById('input-vocab-example-en'),
  inputVocabExampleVi: document.getElementById('input-vocab-example-vi'),
  inputVocabMnemonic: document.getElementById('input-vocab-mnemonic'),
  btnSaveCustomWord: document.getElementById('btn-save-custom-word'),

  vocabQuizModal: document.getElementById('vocab-quiz-modal'),
  vocabQuizClose: document.getElementById('vocab-quiz-close'),
  btnCloseQuiz: document.getElementById('btn-close-quiz'),
  quizQuestionCounter: document.getElementById('quiz-question-counter'),
  quizScorePill: document.getElementById('quiz-score-pill'),
  quizTargetWord: document.getElementById('quiz-target-word'),
  quizTargetIpa: document.getElementById('quiz-target-ipa'),
  quizOptionsGrid: document.getElementById('quiz-options-grid'),
  quizFeedbackBox: document.getElementById('quiz-feedback-box'),
  btnNextQuiz: document.getElementById('btn-next-quiz'),

  // ==========================================
  // STORY GENERATOR MODAL ELEMENTS
  // ==========================================
  btnOpenStoryGen: document.getElementById('btn-open-story-gen'),
  storyGenModal: document.getElementById('story-gen-modal'),
  storyGenClose: document.getElementById('story-gen-close'),
  btnCloseStoryModal: document.getElementById('btn-close-story-modal'),
  storyTargetWordsPills: document.getElementById('story-target-words-pills'),
  btnRunStoryGen: document.getElementById('btn-run-story-gen'),
  storyGenStatus: document.getElementById('story-gen-status'),
  storyResultCard: document.getElementById('story-result-card'),
  storyTitleEn: document.getElementById('story-title-en'),
  storyTitleVi: document.getElementById('story-title-vi'),
  btnPlayStoryAudio: document.getElementById('btn-play-story-audio'),
  btnToggleBilingual: document.getElementById('btn-toggle-bilingual'),
  storyContentEn: document.getElementById('story-content-en'),
  storyContentVi: document.getElementById('story-content-vi'),
  storyQuizSection: document.getElementById('story-quiz-section'),
  storyQuizList: document.getElementById('story-quiz-list'),

  // ==========================================
  // PRONUNCIATION DIFF & SHADOWING ELEMENTS
  // ==========================================
  pronunScoreBadge: document.getElementById('pronun-score-badge'),
  pronunChipsContainer: document.getElementById('pronun-chips-container'),
  btnReplayShadowing: document.getElementById('btn-replay-shadowing'),

  // ==========================================
  // FLOATING INSTANT AI ASSISTANT ELEMENTS
  // ==========================================
  btnFloatingAssistant: document.getElementById('btn-floating-assistant'),
  assistantDrawer: document.getElementById('assistant-drawer'),
  assistantDrawerClose: document.getElementById('assistant-drawer-close'),
  assistantMessagesStream: document.getElementById('assistant-messages-stream'),
  assistantInputBox: document.getElementById('assistant-input-box'),
  btnAssistantSubmit: document.getElementById('btn-assistant-submit'),

  // ==========================================
  // AUTHENTICATION & PROFILE MODAL ELEMENTS
  // ==========================================
  authBtn: document.getElementById('auth-btn'),
  authAvatarIcon: document.getElementById('auth-avatar-icon'),
  authUserName: document.getElementById('auth-user-name'),
  authModal: document.getElementById('auth-modal'),
  authModalClose: document.getElementById('auth-modal-close'),
  authTabNav: document.getElementById('auth-tab-nav'),
  authNavLogin: document.getElementById('auth-nav-login'),
  authNavRegister: document.getElementById('auth-nav-register'),
  authNavForgot: document.getElementById('auth-nav-forgot'),
  authAlert: document.getElementById('auth-alert'),
  authPanelLogin: document.getElementById('auth-panel-login'),
  authPanelRegister: document.getElementById('auth-panel-register'),
  authPanelForgot: document.getElementById('auth-panel-forgot'),
  authPanelProfile: document.getElementById('auth-panel-profile'),
  loginIdentity: document.getElementById('login-identity'),
  loginPassword: document.getElementById('login-password'),
  btnSubmitLogin: document.getElementById('btn-submit-login'),
  linkToRegister: document.getElementById('link-to-register'),
  linkToForgot: document.getElementById('link-to-forgot'),
  registerUsername: document.getElementById('register-username'),
  registerEmail: document.getElementById('register-email'),
  registerPassword: document.getElementById('register-password'),
  btnSubmitRegister: document.getElementById('btn-submit-register'),
  registerPinCard: document.getElementById('register-pin-card'),
  registerPinCode: document.getElementById('register-pin-code'),
  btnCopyPin: document.getElementById('btn-copy-pin'),
  btnPinConfirmDone: document.getElementById('btn-pin-confirm-done'),
  forgotEmail: document.getElementById('forgot-email'),
  forgotPin: document.getElementById('forgot-pin'),
  forgotNewPassword: document.getElementById('forgot-new-password'),
  btnSubmitForgot: document.getElementById('btn-submit-forgot'),
  linkForgotToLogin: document.getElementById('link-forgot-to-login'),
  profileDisplayName: document.getElementById('profile-display-name'),
  profileDisplayEmail: document.getElementById('profile-display-email'),
  profileStreakVal: document.getElementById('profile-streak-val'),
  profileTotalVal: document.getElementById('profile-total-val'),
  profileVocabVal: document.getElementById('profile-vocab-val'),
  btnSubmitLogout: document.getElementById('btn-submit-logout')
};

// ==========================================================================
// AUTHENTICATION & MULTI-USER PROFILE CONTROLLER
// ==========================================================================

async function initAuth() {
  if (state.auth.token) {
    try {
      const me = await fetchMe();
      if (me && me.authenticated && me.user) {
        setAuthUser(me.user, state.auth.token);
      } else {
        clearAuthUser();
      }
    } catch (err) {
      console.warn('Auth token verification failed:', err);
      clearAuthUser();
    }
  }
  updateAuthUI();
}

function updateAuthUI() {
  if (!elements.authUserName) return;
  if (state.auth.user) {
    if (elements.authAvatarIcon) elements.authAvatarIcon.textContent = '🎓';
    elements.authUserName.textContent = state.auth.user.username;
    elements.authBtn.title = `Tài khoản: ${state.auth.user.username} (${state.auth.user.email})`;
  } else {
    if (elements.authAvatarIcon) elements.authAvatarIcon.textContent = '👤';
    elements.authUserName.textContent = 'Đăng nhập';
    elements.authBtn.title = 'Chế độ Khách - Nhấn để Đăng nhập hoặc Tạo tài khoản';
  }
}

function showAuthAlert(msg, type = 'error') {
  if (!elements.authAlert) return;
  elements.authAlert.className = `auth-alert ${type}`;
  elements.authAlert.textContent = msg;
  elements.authAlert.style.display = 'block';
}

function hideAuthAlert() {
  if (!elements.authAlert) return;
  elements.authAlert.style.display = 'none';
}

function switchAuthTab(tab) {
  hideAuthAlert();
  [elements.authNavLogin, elements.authNavRegister, elements.authNavForgot].forEach(btn => {
    if (btn) btn.classList.remove('active');
  });
  [elements.authPanelLogin, elements.authPanelRegister, elements.authPanelForgot, elements.authPanelProfile].forEach(panel => {
    if (panel) panel.style.display = 'none';
  });

  if (tab === 'login') {
    if (elements.authNavLogin) elements.authNavLogin.classList.add('active');
    if (elements.authPanelLogin) elements.authPanelLogin.style.display = 'flex';
  } else if (tab === 'register') {
    if (elements.authNavRegister) elements.authNavRegister.classList.add('active');
    if (elements.authPanelRegister) elements.authPanelRegister.style.display = 'flex';
    if (elements.registerPinCard) elements.registerPinCard.style.display = 'none';
  } else if (tab === 'forgot') {
    if (elements.authNavForgot) elements.authNavForgot.classList.add('active');
    if (elements.authPanelForgot) elements.authPanelForgot.style.display = 'flex';
  } else if (tab === 'profile') {
    if (elements.authPanelProfile) elements.authPanelProfile.style.display = 'flex';
  }
}

function openAuthModal() {
  if (state.assistant && state.assistant.isOpen) {
    toggleAssistantDrawer(false);
  }
  if (state.auth.user) {
    if (elements.authTabNav) elements.authTabNav.style.display = 'none';
    if (elements.profileDisplayName) elements.profileDisplayName.textContent = state.auth.user.username;
    if (elements.profileDisplayEmail) elements.profileDisplayEmail.textContent = state.auth.user.email;
    if (elements.profileStreakVal) elements.profileStreakVal.textContent = `🔥 ${state.streak} Ngày`;
    if (elements.profileTotalVal) elements.profileTotalVal.textContent = `🎯 ${state.totalCompleted} Câu`;
    switchAuthTab('profile');
  } else {
    if (elements.authTabNav) elements.authTabNav.style.display = 'grid';
    switchAuthTab('login');
  }
  if (elements.authModal) {
    elements.authModal.classList.add('active');
    elements.authModal.style.display = 'flex';
  }
}

function closeAuthModal() {
  if (elements.authModal) {
    elements.authModal.classList.remove('active');
    elements.authModal.style.display = 'none';
  }
  hideAuthAlert();
}

async function refreshAllUserData() {
  try {
    const progress = await fetchProgress();
    state.streak = progress.streak || 0;
    state.todayCompleted = progress.today_completed || 0;
    state.totalCompleted = progress.total_completed || 0;
    state.mistakes = progress.mistakes || [];
    updateHeaderStats();

    state.vocabulary = await fetchVocabulary();
    updateVocabStatsUI();
    renderVocabularyView();

    state.roadmap = await fetchRoadmap();
    state.selectedDay = state.roadmap.current_day || 1;
    renderRoadmapView();
  } catch (err) {
    console.warn('Error refreshing user data:', err);
  }
}

function setupAuthEvents() {
  if (elements.authBtn) {
    elements.authBtn.addEventListener('click', openAuthModal);
  }
  if (elements.authModalClose) {
    elements.authModalClose.addEventListener('click', closeAuthModal);
  }
  if (elements.authModal) {
    elements.authModal.addEventListener('click', (e) => {
      if (e.target === elements.authModal) closeAuthModal();
    });
  }

  // Tabs
  if (elements.authNavLogin) elements.authNavLogin.addEventListener('click', () => switchAuthTab('login'));
  if (elements.authNavRegister) elements.authNavRegister.addEventListener('click', () => switchAuthTab('register'));
  if (elements.authNavForgot) elements.authNavForgot.addEventListener('click', () => switchAuthTab('forgot'));

  // Quick switch links
  if (elements.linkToRegister) {
    elements.linkToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('register');
    });
  }
  if (elements.linkToForgot) {
    elements.linkToForgot.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('forgot');
    });
  }
  if (elements.linkForgotToLogin) {
    elements.linkForgotToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('login');
    });
  }

  // Submit Login
  if (elements.btnSubmitLogin) {
    elements.btnSubmitLogin.addEventListener('click', async () => {
      const identity = elements.loginIdentity ? elements.loginIdentity.value.trim() : '';
      const password = elements.loginPassword ? elements.loginPassword.value : '';

      if (!identity || !password) {
        showAuthAlert('Vui lòng nhập đầy đủ Email/Tài khoản và Mật khẩu.');
        return;
      }

      elements.btnSubmitLogin.disabled = true;
      elements.btnSubmitLogin.innerHTML = '<span>⏳ Đang đăng nhập...</span>';
      hideAuthAlert();

      try {
        const res = await loginAccount(identity, password);
        setAuthUser(res.user, res.token);
        updateAuthUI();
        await refreshAllUserData();
        closeAuthModal();
      } catch (err) {
        showAuthAlert(err.message);
      } finally {
        elements.btnSubmitLogin.disabled = false;
        elements.btnSubmitLogin.innerHTML = '<span>🚀 Đăng Nhập Ngay</span>';
      }
    });
  }

  // Submit Register
  if (elements.btnSubmitRegister) {
    elements.btnSubmitRegister.addEventListener('click', async () => {
      const username = elements.registerUsername ? elements.registerUsername.value.trim() : '';
      const email = elements.registerEmail ? elements.registerEmail.value.trim() : '';
      const password = elements.registerPassword ? elements.registerPassword.value : '';

      if (!username || !email || !password) {
        showAuthAlert('Vui lòng điền đầy đủ các thông tin đăng ký.');
        return;
      }

      elements.btnSubmitRegister.disabled = true;
      elements.btnSubmitRegister.innerHTML = '<span>⏳ Đang tạo tài khoản &amp; cấp mã PIN...</span>';
      hideAuthAlert();

      try {
        const res = await registerAccount(email, username, password);
        setAuthUser(res.user, res.token);
        updateAuthUI();
        await refreshAllUserData();

        if (elements.registerPinCode) elements.registerPinCode.textContent = res.recovery_pin || '------';
        if (elements.registerPinCard) elements.registerPinCard.style.display = 'block';
        showAuthAlert('Đăng ký thành công! Hãy lưu lại Mã PIN khôi phục bên dưới.', 'success');
      } catch (err) {
        showAuthAlert(err.message);
      } finally {
        elements.btnSubmitRegister.disabled = false;
        elements.btnSubmitRegister.innerHTML = '<span>✨ Tạo Tài Khoản &amp; Nhận Mã PIN</span>';
      }
    });
  }

  // Copy PIN
  if (elements.btnCopyPin) {
    elements.btnCopyPin.addEventListener('click', () => {
      const pin = elements.registerPinCode ? elements.registerPinCode.textContent.trim() : '';
      if (pin && pin !== '------') {
        navigator.clipboard.writeText(pin).then(() => {
          elements.btnCopyPin.innerHTML = '<span>✓ Đã sao chép!</span>';
          setTimeout(() => {
            elements.btnCopyPin.innerHTML = '<span>📋 Sao chép PIN</span>';
          }, 2500);
        });
      }
    });
  }

  if (elements.btnPinConfirmDone) {
    elements.btnPinConfirmDone.addEventListener('click', () => {
      closeAuthModal();
    });
  }

  // Submit Forgot Password
  if (elements.btnSubmitForgot) {
    elements.btnSubmitForgot.addEventListener('click', async () => {
      const email = elements.forgotEmail ? elements.forgotEmail.value.trim() : '';
      const pin = elements.forgotPin ? elements.forgotPin.value.trim() : '';
      const newPassword = elements.forgotNewPassword ? elements.forgotNewPassword.value : '';

      if (!email || !pin || !newPassword) {
        showAuthAlert('Vui lòng nhập Email, Mã PIN 6 số và Mật khẩu mới.');
        return;
      }

      elements.btnSubmitForgot.disabled = true;
      elements.btnSubmitForgot.innerHTML = '<span>⏳ Đang xử lý khôi phục...</span>';
      hideAuthAlert();

      try {
        const res = await forgotPassword(email, pin, newPassword);
        switchAuthTab('login');
        if (elements.loginIdentity) elements.loginIdentity.value = email;
        showAuthAlert(res.message || 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.', 'success');
      } catch (err) {
        showAuthAlert(err.message);
      } finally {
        elements.btnSubmitForgot.disabled = false;
        elements.btnSubmitForgot.innerHTML = '<span>🔒 Đặt Lại Mật Khẩu &amp; Đăng Nhập</span>';
      }
    });
  }

  // Submit Logout
  if (elements.btnSubmitLogout) {
    elements.btnSubmitLogout.addEventListener('click', async () => {
      try {
        await logoutAccount();
      } catch (e) {
        console.warn('Logout error:', e);
      }
      clearAuthUser();
      updateAuthUI();
      await refreshAllUserData();
      closeAuthModal();
    });
  }

  // Keyboard navigation & Enter key submission for Auth inputs
  if (elements.loginIdentity) {
    elements.loginIdentity.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (elements.loginPassword && !elements.loginPassword.value) {
          elements.loginPassword.focus();
        } else if (elements.btnSubmitLogin) {
          elements.btnSubmitLogin.click();
        }
      }
    });
  }
  if (elements.loginPassword) {
    elements.loginPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && elements.btnSubmitLogin) {
        elements.btnSubmitLogin.click();
      }
    });
  }
  if (elements.registerUsername) {
    elements.registerUsername.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && elements.registerEmail) elements.registerEmail.focus();
    });
  }
  if (elements.registerEmail) {
    elements.registerEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && elements.registerPassword) elements.registerPassword.focus();
    });
  }
  if (elements.registerPassword) {
    elements.registerPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && elements.btnSubmitRegister) {
        elements.btnSubmitRegister.click();
      }
    });
  }
  if (elements.forgotEmail) {
    elements.forgotEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && elements.forgotPin) elements.forgotPin.focus();
    });
  }
  if (elements.forgotPin) {
    elements.forgotPin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && elements.forgotNewPassword) elements.forgotNewPassword.focus();
    });
  }
  if (elements.forgotNewPassword) {
    elements.forgotNewPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && elements.btnSubmitForgot) {
        elements.btnSubmitForgot.click();
      }
    });
  }
}

// ==========================================================================
// APP INITIALIZATION
// ==========================================================================
async function initApp() {
  setTheme(state.theme);
  setupNavigationTabs();
  setupEventListeners();
  setupSpeechEngine();
  setupStoryGeneratorEvents();
  setupPronunciationShadowingEvents();
  setupFloatingAssistantEvents();
  setupAuthEvents();

  try {
    // 0. Verify auth token / initialize user session
    await initAuth();
    // 1. Load config & API Key
    const config = await fetchConfig();
    updateApiStatusUI(config.has_api_key);
    if (config.active_model) {
      state.activeModel = config.active_model;
      if (elements.modelSelect) elements.modelSelect.value = config.active_model;
    }

    // 2. Load Topics & Initial Sentence
    state.topics = await fetchTopics();
    renderTopics();

    // 3. Load Global Progress
    const progress = await fetchProgress();
    state.streak = progress.streak || 0;
    state.todayCompleted = progress.today_completed || 0;
    state.totalCompleted = progress.total_completed || 0;
    state.mistakes = progress.mistakes || [];
    updateHeaderStats();

    // 4. Load Vocabulary Bank
    state.vocabulary = await fetchVocabulary();
    updateVocabStatsUI();

    // 5. Load Roadmap
    state.roadmap = await fetchRoadmap();
    state.selectedDay = state.roadmap.current_day || 1;
    renderRoadmapView();

    // 6. Switch to active tab (default: Roadmap for beginner)
    switchTab(state.currentTab || 'roadmap');

    // 7. Render initial sentence
    renderCurrentSentence();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// ==========================================================================
// NAVIGATION & VIEW SWITCHING
// ==========================================================================
function setupNavigationTabs() {
  const tabs = [
    { btn: elements.tabBtnRoadmap, tab: 'roadmap' },
    { btn: elements.tabBtnVocabulary, tab: 'vocabulary' },
    { btn: elements.tabBtnPractice, tab: 'practice' },
    { btn: elements.tabBtnRoleplay, tab: 'roleplay' }
  ];

  tabs.forEach(({ btn, tab }) => {
    if (btn) {
      btn.addEventListener('click', () => switchTab(tab));
    }
  });
}

function switchTab(tabName) {
  setTab(tabName);

  // Update Tab buttons
  [elements.tabBtnRoadmap, elements.tabBtnVocabulary, elements.tabBtnPractice, elements.tabBtnRoleplay].forEach(btn => {
    if (btn) btn.classList.remove('active');
  });

  // Hide all views
  if (elements.viewRoadmap) elements.viewRoadmap.style.display = 'none';
  if (elements.viewVocabulary) elements.viewVocabulary.style.display = 'none';
  if (elements.viewPractice) elements.viewPractice.style.display = 'none';
  if (elements.viewRoleplay) elements.viewRoleplay.style.display = 'none';

  if (tabName === 'roadmap') {
    if (elements.tabBtnRoadmap) elements.tabBtnRoadmap.classList.add('active');
    if (elements.viewRoadmap) elements.viewRoadmap.style.display = 'flex';
    renderRoadmapView();
  } else if (tabName === 'vocabulary') {
    if (elements.tabBtnVocabulary) elements.tabBtnVocabulary.classList.add('active');
    if (elements.viewVocabulary) elements.viewVocabulary.style.display = 'flex';
    renderVocabularyView();
  } else if (tabName === 'practice') {
    if (elements.tabBtnPractice) elements.tabBtnPractice.classList.add('active');
    if (elements.viewPractice) elements.viewPractice.style.display = 'flex';
    renderCurrentSentence();
  } else if (tabName === 'roleplay') {
    if (elements.tabBtnRoleplay) elements.tabBtnRoleplay.classList.add('active');
    if (elements.viewRoleplay) elements.viewRoleplay.style.display = 'flex';
    initRoleplayArena();
  }
}

// ==========================================================================
// VIEW 1: 3-MONTH (90-DAY) ROADMAP CONTROLLER
// ==========================================================================
function renderRoadmapView() {
  const roadmap = state.roadmap;
  if (!roadmap) return;

  const completedCount = (roadmap.completed_days || []).length;
  const percent = Math.min(100, Math.round((completedCount / 90) * 100));
  
  if (elements.roadmapPercent) elements.roadmapPercent.textContent = `${percent}% (Đã hoàn thành ${completedCount}/90 Ngày)`;
  if (elements.roadmapBarFill) elements.roadmapBarFill.style.width = `${Math.max(2, percent)}%`;
  if (elements.navRoadmapBadge) elements.navRoadmapBadge.textContent = `Ngày ${roadmap.current_day}/90 • B2`;

  // Update Daily Quests
  if (elements.questVocab) {
    const isVocabDone = state.todayCompleted >= 5;
    elements.questVocab.classList.toggle('completed', isVocabDone);
    elements.questVocab.querySelector('.quest-check').textContent = isVocabDone ? '✓' : '○';
  }
  if (elements.questLesson) {
    const isLessonDone = (roadmap.completed_days || []).includes(state.selectedDay);
    elements.questLesson.classList.toggle('completed', isLessonDone);
    elements.questLesson.querySelector('.quest-check').textContent = isLessonDone ? '✓' : '○';
  }
  if (elements.questPractice) {
    const isPracticeDone = state.todayCompleted >= 10;
    elements.questPractice.classList.toggle('completed', isPracticeDone);
    elements.questPractice.querySelector('.quest-check').textContent = isPracticeDone ? '✓' : '○';
  }

  // Render 3 Phases
  renderPhasesGrid();

  // Render Days Timeline
  renderDaysTimeline();

  // Render Active Lesson
  renderLessonCard();

  // Render IPA 44-Sound Chart
  renderIpaChart();
}

function renderPhasesGrid() {
  if (!elements.phasesGrid) return;
  elements.phasesGrid.innerHTML = '';

  const phases = state.roadmap.phases || [];
  const currentDay = state.selectedDay || state.roadmap.current_day || 1;
  const currentPhaseNum = currentDay <= 30 ? 1 : currentDay <= 60 ? 2 : 3;

  phases.forEach(phase => {
    const card = document.createElement('div');
    const isActive = phase.number === currentPhaseNum;
    card.className = `phase-card ${isActive ? 'active' : ''}`;
    card.innerHTML = `
      <div class="phase-num">Giai đoạn ${phase.number}</div>
      <div class="phase-card-title">${escapeHtml(phase.title)}</div>
      <div class="phase-days-range">${escapeHtml(phase.subtitle)} • ${escapeHtml(phase.days_range)}</div>
      <div class="phase-desc">${escapeHtml(phase.description)}</div>
    `;
    card.addEventListener('click', () => {
      // Jump to first day of phase
      const startDay = phase.number === 1 ? 1 : phase.number === 2 ? 31 : 61;
      state.selectedDay = startDay;
      renderRoadmapView();
    });
    elements.phasesGrid.appendChild(card);
  });
}

function renderDaysTimeline() {
  if (!elements.daysScroll) return;
  elements.daysScroll.innerHTML = '';

  const completedSet = new Set(state.roadmap.completed_days || []);
  const allDays = state.roadmap.days || [];
  const totalDays = 90;

  for (let d = 1; d <= totalDays; d++) {
    const chip = document.createElement('div');
    const isCurrent = d === state.selectedDay;
    const isCompleted = completedSet.has(d);
    
    chip.className = `day-chip ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    chip.textContent = `Ngày ${d}`;
    chip.addEventListener('click', () => {
      state.selectedDay = d;
      renderRoadmapView();
    });
    elements.daysScroll.appendChild(chip);
  }
}

function renderLessonCard() {
  const dayNum = state.selectedDay || 1;
  const days = state.roadmap.days || [];
  let dayData = days.find(d => d.day === dayNum);

  // If specific day not in json yet, provide generic scaffold
  if (!dayData) {
    const phaseNum = dayNum <= 30 ? 1 : dayNum <= 60 ? 2 : 3;
    dayData = {
      day: dayNum,
      phase: phaseNum,
      title: `Bài học Ngày ${dayNum}: Mở Rộng Từ Vựng & Cấu Trúc Câu`,
      goal: `Củng cố phản xạ giao tiếp và tích lũy từ vựng cho giai đoạn ${phaseNum}.`,
      theory: `Hôm nay, hãy tập trung vào việc đọc to các câu tiếng Anh và ghi nhớ từ vựng qua Flashcard.\n• Luyện đọc nối âm nhẹ nhàng.\n• Đặt ít nhất 1 câu ví dụ thực tế liên quan đến công việc hoặc đời sống của bạn.`,
      core_vocab: ["practice", "improve", "daily", "fluent", "confidence"],
      sample_sentence: `I practice speaking English step by step every day.`,
      practice_tip: `Hãy bấm nút Loa bên cạnh để nghe phát âm giọng US và nhại lại 3 lần!`
    };
  }

  if (elements.lessonDayBadge) elements.lessonDayBadge.textContent = `Ngày ${dayData.day} / 90 (Giai đoạn ${dayData.phase})`;
  if (elements.lessonTitle) elements.lessonTitle.textContent = dayData.title;
  if (elements.lessonGoal) elements.lessonGoal.textContent = `🎯 Mục tiêu: ${dayData.goal}`;
  if (elements.lessonTheory) elements.lessonTheory.textContent = dayData.theory;
  if (elements.lessonSampleSentence) elements.lessonSampleSentence.textContent = dayData.sample_sentence;
  if (elements.lessonPracticeTip) elements.lessonPracticeTip.textContent = `💡 Mẹo luyện tập: ${dayData.practice_tip}`;

  // Core Vocab chips
  if (elements.coreVocabChips) {
    elements.coreVocabChips.innerHTML = '';
    (dayData.core_vocab || []).forEach(v => {
      const chip = document.createElement('span');
      chip.className = 'vocab-chip-item';
      chip.innerHTML = `<span>🔊</span> <strong>${escapeHtml(v)}</strong>`;
      chip.title = 'Bấm để nghe phát âm từ vựng này';
      chip.addEventListener('click', () => speakText(v, 1.0));
      elements.coreVocabChips.appendChild(chip);
    });
  }

  // Audio for sample sentence
  if (elements.btnSpeakLessonSample) {
    elements.btnSpeakLessonSample.onclick = () => {
      speakText(dayData.sample_sentence, 1.0);
    };
  }

  // Complete button
  if (elements.btnCompleteDay) {
    const isCompleted = (state.roadmap.completed_days || []).includes(dayNum);
    elements.btnCompleteDay.textContent = isCompleted ? '✓ Đã hoàn thành ngày này' : '✓ Hoàn thành bài học';
    elements.btnCompleteDay.disabled = isCompleted;
    elements.btnCompleteDay.onclick = async () => {
      await completeRoadmapDay(dayNum);
      state.roadmap = await fetchRoadmap();
      renderRoadmapView();
    };
  }

  // Practice now button
  if (elements.btnPracticeNow) {
    elements.btnPracticeNow.onclick = () => {
      switchTab('practice');
    };
  }
}

// IPA 44-Sound Chart Data
const IPA_DATA = [
  // Monophthongs (Nguyên âm đơn)
  { symbol: '/iː/', type: 'vowel', example: 'see /siː/ (nhìn)', word: 'see' },
  { symbol: '/ɪ/', type: 'vowel', example: 'sit /sɪt/ (ngồi)', word: 'sit' },
  { symbol: '/ʊ/', type: 'vowel', example: 'put /pʊt/ (đặt)', word: 'put' },
  { symbol: '/uː/', type: 'vowel', example: 'too /tuː/ (quá/cũng)', word: 'too' },
  { symbol: '/e/', type: 'vowel', example: 'ten /ten/ (số mười)', word: 'ten' },
  { symbol: '/ə/', type: 'vowel', example: 'about /əˈbaʊt/ (về)', word: 'about' },
  { symbol: '/ɜː/', type: 'vowel', example: 'bird /bɝːd/ (chim)', word: 'bird' },
  { symbol: '/ɔː/', type: 'vowel', example: 'saw /sɔː/ (nhìn thấy)', word: 'saw' },
  { symbol: '/æ/', type: 'vowel', example: 'cat /kæt/ (mèo)', word: 'cat' },
  { symbol: '/ʌ/', type: 'vowel', example: 'cup /kʌp/ (cốc)', word: 'cup' },
  { symbol: '/ɑː/', type: 'vowel', example: 'car /kɑːr/ (ô tô)', word: 'car' },
  { symbol: '/ɒ/', type: 'vowel', example: 'hot /hɑːt/ (nóng)', word: 'hot' },

  // Diphthongs (Nguyên âm đôi)
  { symbol: '/ɪə/', type: 'diphthong', example: 'here /hɪr/ (ở đây)', word: 'here' },
  { symbol: '/eɪ/', type: 'diphthong', example: 'day /deɪ/ (ngày)', word: 'day' },
  { symbol: '/ʊə/', type: 'diphthong', example: 'tour /tʊr/ (du lịch)', word: 'tour' },
  { symbol: '/ɔɪ/', type: 'diphthong', example: 'boy /bɔɪ/ (cậu bé)', word: 'boy' },
  { symbol: '/əʊ/', type: 'diphthong', example: 'go /ɡoʊ/ (đi)', word: 'go' },
  { symbol: '/eə/', type: 'diphthong', example: 'hair /her/ (tóc)', word: 'hair' },
  { symbol: '/aɪ/', type: 'diphthong', example: 'my /maɪ/ (của tôi)', word: 'my' },
  { symbol: '/aʊ/', type: 'diphthong', example: 'how /haʊ/ (thế nào)', word: 'how' },

  // Consonants (Phụ âm)
  { symbol: '/p/', type: 'consonant', example: 'pen /pen/ (bút)', word: 'pen' },
  { symbol: '/b/', type: 'consonant', example: 'bad /bæd/ (tồi)', word: 'bad' },
  { symbol: '/t/', type: 'consonant', example: 'tea /tiː/ (trà)', word: 'tea' },
  { symbol: '/d/', type: 'consonant', example: 'did /dɪd/ (đã làm)', word: 'did' },
  { symbol: '/tʃ/', type: 'consonant', example: 'check /tʃek/ (kiểm tra)', word: 'check' },
  { symbol: '/dʒ/', type: 'consonant', example: 'job /dʒɑːb/ (việc)', word: 'job' },
  { symbol: '/k/', type: 'consonant', example: 'code /koʊd/ (mã)', word: 'code' },
  { symbol: '/ɡ/', type: 'consonant', example: 'get /ɡet/ (lấy)', word: 'get' },
  { symbol: '/f/', type: 'consonant', example: 'fix /fɪks/ (sửa)', word: 'fix' },
  { symbol: '/v/', type: 'consonant', example: 'very /ˈver.i/ (rất)', word: 'very' },
  { symbol: '/θ/', type: 'consonant', example: 'think /θɪŋk/ (nghĩ)', word: 'think' },
  { symbol: '/ð/', type: 'consonant', example: 'this /ðɪs/ (cái này)', word: 'this' },
  { symbol: '/s/', type: 'consonant', example: 'see /siː/ (thấy)', word: 'see' },
  { symbol: '/z/', type: 'consonant', example: 'zoo /zuː/ (vườn thú)', word: 'zoo' },
  { symbol: '/ʃ/', type: 'consonant', example: 'she /ʃiː/ (cô ấy)', word: 'she' },
  { symbol: '/ʒ/', type: 'consonant', example: 'vision /ˈvɪʒ.ən/ (tầm nhìn)', word: 'vision' },
  { symbol: '/m/', type: 'consonant', example: 'make /meɪk/ (làm)', word: 'make' },
  { symbol: '/n/', type: 'consonant', example: 'now /naʊ/ (bây giờ)', word: 'now' },
  { symbol: '/ŋ/', type: 'consonant', example: 'sing /sɪŋ/ (hát)', word: 'sing' },
  { symbol: '/h/', type: 'consonant', example: 'help /help/ (giúp)', word: 'help' },
  { symbol: '/l/', type: 'consonant', example: 'learn /lɝːn/ (học)', word: 'learn' },
  { symbol: '/r/', type: 'consonant', example: 'run /rʌn/ (chạy)', word: 'run' },
  { symbol: '/w/', type: 'consonant', example: 'work /wɝːk/ (làm việc)', word: 'work' },
  { symbol: '/j/', type: 'consonant', example: 'yes /jes/ (đúng)', word: 'yes' }
];

let lastIpaWord = 'see';

function renderIpaChart() {
  if (!elements.ipaGridContainer) return;
  elements.ipaGridContainer.innerHTML = '';

  IPA_DATA.forEach(item => {
    const btn = document.createElement('div');
    const pillClass = item.type === 'vowel' ? 'ipa-pill-vowel' : item.type === 'diphthong' ? 'ipa-pill-diphthong' : 'ipa-pill-consonant';
    btn.className = `ipa-sound-btn ${pillClass}`;
    btn.innerHTML = `
      <span class="ipa-symbol">${item.symbol}</span>
      <span class="ipa-example">${item.word}</span>
    `;
    btn.addEventListener('click', () => {
      lastIpaWord = item.word;
      speakText(item.word, 0.9);
      if (elements.ipaPreviewBox) {
        elements.ipaPreviewBox.style.display = 'flex';
        elements.ipaCurrentSound.textContent = item.symbol;
        elements.ipaCurrentWord.textContent = item.example;
      }
    });
    elements.ipaGridContainer.appendChild(btn);
  });

  if (elements.btnReplayIpa) {
    elements.btnReplayIpa.onclick = () => {
      speakText(lastIpaWord, 0.9);
    };
  }
}

// ==========================================================================
// VIEW 2: VOCABULARY & FLASHCARDS CONTROLLER
// ==========================================================================
function updateVocabStatsUI() {
  const all = state.vocabulary || [];
  const todayStr = getTodayDateString();
  const due = all.filter(v => !v.next_review || v.next_review <= todayStr);
  const mastered = all.filter(v => v.srs_stage >= 4);
  const tech = all.filter(v => (v.level && v.level.toLowerCase().includes('tech')) || (v.level && v.level.toLowerCase().includes('ai')));
  const a1 = all.filter(v => v.level && v.level.toUpperCase().startsWith('A1'));
  const a2 = all.filter(v => v.level && v.level.toUpperCase().startsWith('A2'));
  const b1 = all.filter(v => v.level && v.level.toUpperCase().startsWith('B1'));
  const b2 = all.filter(v => v.level && v.level.toUpperCase().startsWith('B2'));

  if (elements.countAll) elements.countAll.textContent = all.length;
  if (elements.countA1) elements.countA1.textContent = a1.length;
  if (elements.countA2) elements.countA2.textContent = a2.length;
  if (elements.countB1) elements.countB1.textContent = b1.length;
  if (elements.countB2) elements.countB2.textContent = b2.length;
  if (elements.countDue) elements.countDue.textContent = due.length;
  if (elements.countMastered) elements.countMastered.textContent = mastered.length;
  if (elements.countTech) elements.countTech.textContent = tech.length;
  if (elements.navVocabBadge) elements.navVocabBadge.textContent = `${due.length} Cần ôn`;
  if (elements.tableTotalCount) elements.tableTotalCount.textContent = all.length;
}

function renderVocabularyView() {
  updateVocabStatsUI();
  const list = getFilteredVocabList();
  
  if (list.length === 0) {
    if (elements.flashcardCounter) elements.flashcardCounter.textContent = '0 / 0';
    if (elements.fcWord) elements.fcWord.textContent = 'Chưa có từ vựng phù hợp';
    if (elements.fcMeaning) elements.fcMeaning.textContent = 'Hãy đổi bộ lọc hoặc thêm từ vựng mới bằng AI!';
    return;
  }

  if (state.currentVocabIndex >= list.length) {
    state.currentVocabIndex = 0;
  }

  const item = list[state.currentVocabIndex];
  renderSingleFlashcard(item, state.currentVocabIndex + 1, list.length);
  renderVocabTable(list);
}

function renderSingleFlashcard(item, currentIndex, totalCount) {
  state.isFlashcardFlipped = false;
  if (elements.flashcardContainer) {
    elements.flashcardContainer.classList.remove('flipped');
  }

  if (elements.flashcardCounter) elements.flashcardCounter.textContent = `Thẻ ${currentIndex} / ${totalCount}`;
  if (elements.vocabPageIndicator) elements.vocabPageIndicator.textContent = `${currentIndex} / ${totalCount}`;
  if (elements.flashcardSrsStatus) {
    const stageNames = ['Mới học (Stage 1)', 'Khá nhớ (Stage 2)', 'Thành thạo (Stage 3)', 'Đã thuộc (Stage 4)', 'Mastered (Stage 5)'];
    const stageIndex = Math.min(stageNames.length - 1, (item.srs_stage || 1) - 1);
    elements.flashcardSrsStatus.textContent = `Giai đoạn: ${stageNames[stageIndex]} • Ôn: ${item.review_count || 0} lần`;
  }

  // Front face
  if (elements.fcLevel) elements.fcLevel.textContent = item.level || 'A1-Daily';
  if (elements.fcPos) elements.fcPos.textContent = item.part_of_speech || 'noun';
  if (elements.fcWord) elements.fcWord.textContent = item.word;
  if (elements.fcIpa) elements.fcIpa.textContent = item.ipa || `/${item.word.toLowerCase()}/`;

  // Back face
  if (elements.fcMeaning) elements.fcMeaning.textContent = item.meaning;
  if (elements.fcExampleEn) elements.fcExampleEn.textContent = item.example_en;
  if (elements.fcExampleVi) elements.fcExampleVi.textContent = item.example_vi || '';
  if (elements.fcMnemonic) elements.fcMnemonic.textContent = item.mnemonic || `Tự đặt 1 câu thực tế với "${item.word}" để ghi nhớ sâu.`;

  // Audio button
  if (elements.btnSpeakVocab) {
    elements.btnSpeakVocab.onclick = (e) => {
      e.stopPropagation();
      speakText(item.word, 0.95);
    };
  }
}

function flipFlashcard() {
  state.isFlashcardFlipped = !state.isFlashcardFlipped;
  if (elements.flashcardContainer) {
    elements.flashcardContainer.classList.toggle('flipped', state.isFlashcardFlipped);
  }
}

let flashcardToastTimer = null;
function showFlashcardToast(type, text) {
  if (!elements.flashcardSaveToast) return;
  clearTimeout(flashcardToastTimer);
  elements.flashcardSaveToast.className = `flashcard-save-toast ${type} show`;
  elements.flashcardSaveToast.innerHTML = text;
  flashcardToastTimer = setTimeout(() => {
    if (elements.flashcardSaveToast) {
      elements.flashcardSaveToast.classList.remove('show');
    }
  }, 1800);
}

async function handleSrsGrade(grade) {
  const list = getFilteredVocabList();
  if (list.length === 0) return;

  const currentItem = list[state.currentVocabIndex];
  if (!currentItem) return;

  // Show visual feedback toast immediately
  if (grade === 0) {
    showFlashcardToast('again', '🔴 Đã lưu: Chưa nhớ (Sẽ ôn lại hôm nay)');
  } else if (grade === 3) {
    showFlashcardToast('known', '🟢 Đã lưu: Đã biết / Đã thuộc (+7 ngày)');
  } else if (grade === 1) {
    showFlashcardToast('again', '🟠 Đã lưu: Khó (+1 ngày)');
  } else if (grade === 2) {
    showFlashcardToast('known', '🟡 Đã lưu: Tốt (+3 ngày)');
  }

  try {
    const res = await reviewVocabulary(currentItem.id, grade);
    if (res.success && res.item) {
      // Update in local state
      const idx = state.vocabulary.findIndex(v => v.id === currentItem.id);
      if (idx !== -1) {
        state.vocabulary[idx] = res.item;
      }
    }
  } catch (err) {
    console.warn('SRS review sync error:', err);
  }

  // Reset flip to front and advance to next card smoothly
  state.isFlashcardFlipped = false;
  state.currentVocabIndex = (state.currentVocabIndex + 1) % list.length;
  renderVocabularyView();
}

function renderVocabTable(list) {
  if (!elements.vocabTableBody) return;
  elements.vocabTableBody.innerHTML = '';

  const total = list.length;
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (state.vocabTablePage > totalPages) {
    state.vocabTablePage = totalPages;
  }
  if (state.vocabTablePage < 1) {
    state.vocabTablePage = 1;
  }

  const startIdx = (state.vocabTablePage - 1) * pageSize;
  const endIdx = Math.min(total, startIdx + pageSize);
  const pagedList = list.slice(startIdx, endIdx);

  if (elements.tablePageInfo) {
    elements.tablePageInfo.textContent = `Trang ${state.vocabTablePage} / ${totalPages} (Hiển thị ${total === 0 ? 0 : startIdx + 1} - ${endIdx} trong ${total} từ)`;
  }
  if (elements.btnTablePrev) {
    elements.btnTablePrev.disabled = state.vocabTablePage <= 1;
  }
  if (elements.btnTableNext) {
    elements.btnTableNext.disabled = state.vocabTablePage >= totalPages;
  }

  const fragment = document.createDocumentFragment();
  pagedList.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(v.word)}</strong></td>
      <td style="color: var(--accent-cyan); font-family: monospace;">${escapeHtml(v.ipa || '')}</td>
      <td>${escapeHtml(v.meaning)}</td>
      <td><span class="badge-level">${escapeHtml(v.level || 'A1')}</span></td>
      <td>Stage ${v.srs_stage || 1}</td>
      <td>${escapeHtml(v.next_review || 'Hôm nay')}</td>
      <td>
        <button class="btn-icon" title="Nghe phát âm"><span>🔊</span></button>
      </td>
    `;
    const speakBtn = tr.querySelector('button');
    if (speakBtn) {
      speakBtn.onclick = () => speakText(v.word, 0.95);
    }
    fragment.appendChild(tr);
  });
  elements.vocabTableBody.appendChild(fragment);
}

// ==========================================================================
// VIEW 3: PRACTICE ARENA (REFLEX TRANSLATION & SCAFFOLDING)
// ==========================================================================
function renderTopics() {
  if (!elements.topicsScroll) return;
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

  if (elements.currentTopicBadge) elements.currentTopicBadge.innerHTML = `${topic.icon} ${topic.name}`;
  if (elements.sentenceCounter) elements.sentenceCounter.textContent = `Câu ${state.currentSentenceIndex + 1} / ${topic.sentences.length}`;
  if (elements.situationVietnamese) elements.situationVietnamese.textContent = sentence.vietnamese;
  if (elements.situationContext) elements.situationContext.textContent = sentence.context || topic.description;
  
  if (sentence.hint) {
    if (elements.situationHintWrap) elements.situationHintWrap.style.display = 'none';
    if (elements.situationHint) elements.situationHint.textContent = sentence.hint;
    if (elements.btnToggleHint) elements.btnToggleHint.style.display = 'inline-flex';
  } else {
    if (elements.situationHintWrap) elements.situationHintWrap.style.display = 'none';
    if (elements.btnToggleHint) elements.btnToggleHint.style.display = 'none';
  }

  if (elements.englishInput) elements.englishInput.value = '';
  if (elements.grammarlyBar) {
    elements.grammarlyBar.style.display = 'none';
    if (elements.suggestionsContainer) elements.suggestionsContainer.innerHTML = '';
  }

  // Update Scramble Mode vs Free Typing Mode
  updatePracticeModeUI();

  if (elements.englishInput && state.practiceMode === 'typing') {
    elements.englishInput.focus();
  }
}

function updatePracticeModeUI() {
  const isScramble = state.practiceMode === 'scramble';
  if (elements.btnModeScramble) elements.btnModeScramble.classList.toggle('active', isScramble);
  if (elements.btnModeTyping) elements.btnModeTyping.classList.toggle('active', !isScramble);
  if (elements.scrambleBox) elements.scrambleBox.style.display = isScramble ? 'flex' : 'none';

  if (isScramble) {
    renderScrambleChips();
  }
}

function renderScrambleChips() {
  if (!elements.scrambleChips) return;
  elements.scrambleChips.innerHTML = '';

  const sentence = getCurrentSentence();
  if (!sentence) return;

  // Extract hints or vocabulary words + a couple of distractors
  let words = [];
  if (sentence.hint) {
    words = sentence.hint.split(/[,\s]+/).map(w => w.trim().replace(/[.,!?]/g, '')).filter(Boolean);
  }
  
  // Add common scaffolding words
  const scaffoldPills = ["I", "We", "The", "is", "are", "have", "will", "because", "please", "can"];
  scaffoldPills.slice(0, 4).forEach(p => {
    if (!words.includes(p)) words.push(p);
  });

  // Shuffle array
  words.sort(() => Math.random() - 0.5);

  words.forEach(word => {
    const pill = document.createElement('span');
    pill.className = 'scramble-word-pill';
    pill.textContent = word;
    pill.addEventListener('click', () => {
      pill.classList.add('used');
      const currentVal = elements.englishInput.value.trim();
      elements.englishInput.value = currentVal ? `${currentVal} ${word}` : word;
      triggerQuickCheckDebounced(true);
    });
    elements.scrambleChips.appendChild(pill);
  });
}

function resetScrambleChips() {
  if (elements.englishInput) elements.englishInput.value = '';
  const pills = elements.scrambleChips ? elements.scrambleChips.querySelectorAll('.scramble-word-pill') : [];
  pills.forEach(p => p.classList.remove('used'));
  if (elements.grammarlyBar) elements.grammarlyBar.style.display = 'none';
}

// ==========================================================================
// GRAMMARLY ASSISTANT & EVALUATION
// ==========================================================================
let quickCheckTimeout = null;

function triggerQuickCheckDebounced(immediate = false) {
  clearTimeout(quickCheckTimeout);
  const text = elements.englishInput.value.trim();
  if (!text || text.length < 3) {
    if (elements.grammarlyBar) elements.grammarlyBar.style.display = 'none';
    return;
  }

  if (immediate) {
    performQuickCheck(text);
  } else {
    quickCheckTimeout = setTimeout(() => {
      performQuickCheck(text);
    }, 700);
  }
}

async function performQuickCheck(text) {
  if (!text) return;
  const topic = getCurrentTopic();
  
  if (elements.grammarlyBar) {
    elements.grammarlyBar.style.display = 'flex';
    elements.grammarlyStatusIcon.textContent = '⏳';
    elements.grammarlyStatusText.textContent = 'Grammarly đang phân tích ngữ pháp...';
  }

  try {
    const res = await quickCheckGrammar({
      text,
      topicName: topic ? topic.name : 'General English',
      customApiKey: state.apiKey || null
    });

    if (res.metrics) {
      if (elements.mCorrectness) elements.mCorrectness.textContent = `${res.metrics.correctness || 85}%`;
      if (elements.mClarity) elements.mClarity.textContent = `${res.metrics.clarity || 85}%`;
      if (elements.mEngagement) elements.mEngagement.textContent = `${res.metrics.engagement || 80}%`;
      if (elements.mDelivery) elements.mDelivery.textContent = `${res.metrics.delivery || 85}%`;
    }

    if (elements.suggestionsContainer) {
      elements.suggestionsContainer.innerHTML = '';
      if (res.inline_suggestions && res.inline_suggestions.length > 0) {
        if (elements.grammarlyStatusIcon) elements.grammarlyStatusIcon.textContent = '💡';
        if (elements.grammarlyStatusText) elements.grammarlyStatusText.textContent = `Phát hiện ${res.inline_suggestions.length} gợi ý tối ưu`;
        
        res.inline_suggestions.forEach(s => {
          const card = document.createElement('div');
          card.className = 'suggestion-card';
          card.innerHTML = `
            <div class="sugg-header">
              <span class="sugg-type sugg-type-${s.type || 'grammar'}">${s.type || 'Gợi ý'}</span>
              <span class="sugg-change"><del>${escapeHtml(s.original)}</del> ➔ <strong>${escapeHtml(s.replacement)}</strong></span>
            </div>
            <div class="sugg-expl">${escapeHtml(s.explanation)}</div>
            <div>
              <button class="btn-accept-fix" type="button">✓ Áp dụng sửa</button>
            </div>
          `;
          card.querySelector('.btn-accept-fix').addEventListener('click', () => {
            applySuggestion(s.original, s.replacement);
            card.remove();
          });
          elements.suggestionsContainer.appendChild(card);
        });
      } else {
        if (elements.grammarlyStatusIcon) elements.grammarlyStatusIcon.textContent = '✨';
        if (elements.grammarlyStatusText) elements.grammarlyStatusText.textContent = 'Câu văn rất chuẩn xác!';
      }
    }
  } catch (err) {
    if (elements.grammarlyStatusIcon) elements.grammarlyStatusIcon.textContent = '🟢';
    if (elements.grammarlyStatusText) elements.grammarlyStatusText.textContent = 'Sẵn sàng kiểm tra.';
  }
}

function applySuggestion(original, replacement) {
  let text = elements.englishInput.value;
  text = text.replace(original, replacement);
  elements.englishInput.value = text;
  triggerQuickCheckDebounced(true);
}

async function handleCheckAnswer() {
  const sentence = getCurrentSentence();
  const userEnglish = elements.englishInput.value.trim();

  if (!userEnglish) {
    elements.englishInput.focus();
    return;
  }

  elements.btnCheck.disabled = true;
  elements.btnCheck.innerHTML = '<span>Đang chấm điểm...</span>';

  try {
    const result = await evaluateTranslation({
      topicId: state.currentTopicId,
      vietnamese: sentence.vietnamese,
      userEnglish: userEnglish,
      isVoice: false,
      customApiKey: state.apiKey || null
    });

    state.currentEvaluation = result;
    displayFeedback(result, userEnglish);

    // Save Progress
    const isPass = result.score >= 75;
    let mistakeItem = null;
    if (!isPass) {
      mistakeItem = {
        id: `m-${Date.now()}`,
        topic_id: state.currentTopicId,
        vietnamese: sentence.vietnamese,
        user_english: userEnglish,
        corrected_sentence: result.corrected_sentence,
        explanation: result.grammar_errors && result.grammar_errors.length > 0 ? result.grammar_errors[0].explanation : 'Cần ôn lại cấu trúc câu.',
        timestamp: new Date().toISOString()
      };
    }

    const progRes = await saveProgress({
      date: getTodayDateString(),
      completedIncrement: 1,
      score: result.score,
      mistakeItem
    });

    if (progRes.success && progRes.progress) {
      state.streak = progRes.progress.streak || 0;
      state.todayCompleted = progRes.progress.today_completed || 0;
      state.totalCompleted = progRes.progress.total_completed || 0;
      state.mistakes = progRes.progress.mistakes || [];
      updateHeaderStats();
    }
  } catch (error) {
    alert(`Không thể chấm điểm: ${error.message}`);
  } finally {
    elements.btnCheck.disabled = false;
    elements.btnCheck.innerHTML = '<span>Kiểm tra đáp án</span> <span>➔</span>';
  }
}

function displayFeedback(result, userEnglish = '') {
  elements.feedbackContainer.classList.add('visible');

  // Score circle
  elements.scoreCircle.textContent = result.score;
  elements.scoreCircle.className = 'score-circle';
  if (result.score >= 90) elements.scoreCircle.classList.add('score-excellent');
  else if (result.score >= 70) elements.scoreCircle.classList.add('score-good');
  else elements.scoreCircle.classList.add('score-needs-work');

  // Verdict
  if (result.score >= 90) {
    elements.verdictTitle.textContent = 'Xuất sắc!';
    elements.verdictSub.textContent = 'Câu văn tự nhiên, ngữ pháp chính xác.';
  } else if (result.score >= 70) {
    elements.verdictTitle.textContent = 'Rất tốt!';
    elements.verdictSub.textContent = 'Hiểu đúng ngữ cảnh, cần trau chuốt một số từ vựng.';
  } else {
    elements.verdictTitle.textContent = 'Cần luyện tập thêm!';
    elements.verdictSub.textContent = 'Xem kỹ bản sửa lỗi bên dưới và nghe mẫu phát âm nhé.';
  }

  // Corrected text & Alternative
  elements.correctedText.textContent = result.corrected_sentence;
  elements.nativeAltText.textContent = result.natural_alternative || result.corrected_sentence;

  // Audio Playback
  elements.btnSpeakCorrected.onclick = () => {
    speakText(result.corrected_sentence, getSpeechRate());
  };

  // Grammar errors
  elements.grammarBreakdown.innerHTML = '';
  if (result.grammar_errors && result.grammar_errors.length > 0) {
    result.grammar_errors.forEach(err => {
      const card = document.createElement('div');
      card.className = 'grammar-error-card';
      card.innerHTML = `
        <div class="error-diff">
          <span class="diff-original">${escapeHtml(err.original)}</span>
          <span style="color: var(--text-muted)">➔</span>
          <span class="diff-fix">${escapeHtml(err.fix)}</span>
        </div>
        <div class="error-expl">${escapeHtml(err.explanation)}</div>
      `;
      elements.grammarBreakdown.appendChild(card);
    });
  } else {
    elements.grammarBreakdown.innerHTML = '<div style="color: #34d399; font-weight: 600;">✓ Không có lỗi ngữ pháp lớn! Rất chuẩn xác.</div>';
  }

  // Vocab spotlight
  elements.vocabSpotlight.innerHTML = '';
  if (result.vocabulary_tips && result.vocabulary_tips.length > 0) {
    result.vocabulary_tips.forEach(v => {
      const pill = document.createElement('div');
      pill.className = 'vocab-pill';
      pill.innerHTML = `
        <span class="vocab-term">${escapeHtml(v.term)}</span>
        <span class="vocab-meaning">${escapeHtml(v.meaning)}</span>
      `;
      elements.vocabSpotlight.appendChild(pill);
    });
  } else {
    elements.vocabSpotlight.textContent = 'Dùng từ vựng chuẩn xác ngữ cảnh!';
  }

  // Speaking advice & Pronunciation Diff
  if (elements.speakingAdvice) {
    elements.speakingAdvice.textContent = result.speaking_feedback || 'Bấm nút Loa ở trên để nghe phát âm, sau đó đọc nhại lại 3 lần để rèn phản xạ cơ miệng.';
  }

  // Trigger AI Pronunciation Diff evaluation
  const targetSent = result.corrected_sentence || (getCurrentSentence() ? getCurrentSentence().english : '');
  handlePronunciationDiffEvaluation(targetSent, userEnglish || elements.englishInput.value.trim());

  // Encouragement
  elements.encouragementText.textContent = result.encouragement || 'Mỗi ngày kiên trì 15 phút sẽ giúp bạn nói tiếng Anh tự nhiên!';

  // Scroll smoothly to feedback
  elements.feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    state.currentSentenceIndex = 0;
  }

  hideFeedback();
  renderCurrentSentence();
}

// ==========================================================================
// MODALS LOGIC (AI VOCAB, QUIZ, SETTINGS, MISTAKES)
// ==========================================================================
function setupEventListeners() {
  // Theme toggle
  elements.themeToggle.addEventListener('click', () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // Practice buttons
  elements.btnCheck.addEventListener('click', handleCheckAnswer);
  elements.btnNextSentence.addEventListener('click', goToNextSentence);
  elements.btnRetrySentence.addEventListener('click', () => {
    hideFeedback();
    elements.englishInput.focus();
  });
  elements.btnSkip.addEventListener('click', goToNextSentence);
  elements.btnToggleHint.addEventListener('click', () => {
    const isHidden = elements.situationHintWrap.style.display === 'none';
    elements.situationHintWrap.style.display = isHidden ? 'block' : 'none';
  });

  // Beginner Scramble Mode vs Typing Mode
  if (elements.btnModeScramble) {
    elements.btnModeScramble.addEventListener('click', () => {
      setPracticeMode('scramble');
      updatePracticeModeUI();
    });
  }
  if (elements.btnModeTyping) {
    elements.btnModeTyping.addEventListener('click', () => {
      setPracticeMode('typing');
      updatePracticeModeUI();
      elements.englishInput.focus();
    });
  }
  if (elements.btnScrambleReset) {
    elements.btnScrambleReset.addEventListener('click', resetScrambleChips);
  }

  // Topic Filters
  const topicTabs = elements.topicCategories ? elements.topicCategories.querySelectorAll('.tab-btn') : [];
  topicTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      topicTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.dataset.filter;
      renderTopics();
    });
  });

  // Speech Speed buttons
  elements.speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setSpeechRate(parseFloat(btn.dataset.speed));
    });
  });

  // Mic Button
  elements.micBtn.addEventListener('click', () => {
    toggleRecording();
  });

  // Flashcard Flip & Quick Save Action Buttons
  if (elements.flashcardContainer) {
    elements.flashcardContainer.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      flipFlashcard();
    });
  }
  if (elements.btnFlipCard) {
    elements.btnFlipCard.addEventListener('click', (e) => {
      e.stopPropagation();
      flipFlashcard();
    });
  }
  if (elements.btnFlipBack) {
    elements.btnFlipBack.addEventListener('click', (e) => {
      e.stopPropagation();
      flipFlashcard();
    });
  }
  if (elements.btnCardFrontAgain) {
    elements.btnCardFrontAgain.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSrsGrade(0);
    });
  }
  if (elements.btnCardFrontKnown) {
    elements.btnCardFrontKnown.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSrsGrade(3);
    });
  }
  if (elements.btnCardBackAgain) {
    elements.btnCardBackAgain.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSrsGrade(0);
    });
  }
  if (elements.btnCardBackKnown) {
    elements.btnCardBackKnown.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSrsGrade(3);
    });
  }

  // SRS Rating Buttons
  const srsBtns = document.querySelectorAll('.srs-btn');
  srsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const grade = parseInt(btn.dataset.grade, 10);
      handleSrsGrade(grade);
    });
  });

  // Flashcard Prev / Next
  if (elements.btnVocabPrev) {
    elements.btnVocabPrev.addEventListener('click', () => {
      const list = getFilteredVocabList();
      if (list.length === 0) return;
      state.currentVocabIndex = (state.currentVocabIndex - 1 + list.length) % list.length;
      renderVocabularyView();
    });
  }
  if (elements.btnVocabNext) {
    elements.btnVocabNext.addEventListener('click', () => {
      const list = getFilteredVocabList();
      if (list.length === 0) return;
      state.currentVocabIndex = (state.currentVocabIndex + 1) % list.length;
      renderVocabularyView();
    });
  }

  // Random Flashcard Shuffle
  if (elements.btnVocabRandom) {
    elements.btnVocabRandom.addEventListener('click', () => {
      const list = getFilteredVocabList();
      if (list.length <= 1) return;
      let nextIdx = Math.floor(Math.random() * list.length);
      if (nextIdx === state.currentVocabIndex) {
        nextIdx = (nextIdx + 1) % list.length;
      }
      state.currentVocabIndex = nextIdx;
      renderVocabularyView();
    });
  }

  // Vocab Table Pagination Prev / Next
  if (elements.btnTablePrev) {
    elements.btnTablePrev.addEventListener('click', () => {
      if (state.vocabTablePage > 1) {
        state.vocabTablePage--;
        const list = getFilteredVocabList();
        renderVocabTable(list);
      }
    });
  }
  if (elements.btnTableNext) {
    elements.btnTableNext.addEventListener('click', () => {
      const list = getFilteredVocabList();
      const totalPages = Math.max(1, Math.ceil(list.length / 50));
      if (state.vocabTablePage < totalPages) {
        state.vocabTablePage++;
        renderVocabTable(list);
      }
    });
  }

  // Vocab Filter Tabs
  const vFilterBtns = document.querySelectorAll('.vocab-filters .tab-btn');
  vFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      vFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.vocabFilter = btn.dataset.vfilter;
      state.currentVocabIndex = 0;
      state.vocabTablePage = 1;
      renderVocabularyView();
    });
  });

  // Vocab Search
  if (elements.vocabSearchInput) {
    elements.vocabSearchInput.addEventListener('input', (e) => {
      state.vocabSearchQuery = e.target.value;
      state.currentVocabIndex = 0;
      state.vocabTablePage = 1;
      renderVocabularyView();
    });
  }

  // Add Custom Vocab Modal
  if (elements.btnOpenAddVocab) {
    elements.btnOpenAddVocab.addEventListener('click', () => {
      elements.inputVocabWord.value = '';
      elements.inputVocabIpa.value = '';
      elements.inputVocabMeaning.value = '';
      elements.inputVocabExampleEn.value = '';
      elements.inputVocabExampleVi.value = '';
      elements.inputVocabMnemonic.value = '';
      elements.aiVocabStatus.style.display = 'none';
      elements.addVocabModal.classList.add('active');
      elements.inputVocabWord.focus();
    });
  }

  if (elements.addVocabClose) elements.addVocabClose.onclick = () => elements.addVocabModal.classList.remove('active');
  if (elements.addVocabCancel) elements.addVocabCancel.onclick = () => elements.addVocabModal.classList.remove('active');

  // AI Analyze Word
  if (elements.btnAiAnalyzeWord) {
    elements.btnAiAnalyzeWord.addEventListener('click', async () => {
      const word = elements.inputVocabWord.value.trim();
      if (!word) {
        elements.inputVocabWord.focus();
        return;
      }

      elements.btnAiAnalyzeWord.disabled = true;
      elements.aiVocabStatus.style.display = 'block';
      elements.aiVocabStatus.style.color = '#38bdf8';
      elements.aiVocabStatus.textContent = '⏳ Gemini đang tra cứu IPA, dịch nghĩa và soạn câu ví dụ...';

      try {
        const details = await aiGenerateVocab(word, null, state.apiKey || null);
        elements.inputVocabIpa.value = details.ipa || '';
        elements.inputVocabMeaning.value = details.meaning || '';
        elements.inputVocabExampleEn.value = details.example_en || '';
        elements.inputVocabExampleVi.value = details.example_vi || '';
        elements.inputVocabMnemonic.value = details.mnemonic || '';
        elements.aiVocabStatus.style.color = '#34d399';
        elements.aiVocabStatus.textContent = '✓ Phân tích thành công! Bấm lưu để thêm vào kho.';
      } catch (err) {
        elements.aiVocabStatus.style.color = '#fb7185';
        elements.aiVocabStatus.textContent = `Lỗi: ${err.message}`;
      } finally {
        elements.btnAiAnalyzeWord.disabled = false;
      }
    });
  }

  // Save Custom Word
  if (elements.btnSaveCustomWord) {
    elements.btnSaveCustomWord.addEventListener('click', async () => {
      const word = elements.inputVocabWord.value.trim();
      const meaning = elements.inputVocabMeaning.value.trim();
      if (!word || !meaning) {
        alert('Vui lòng nhập từ vựng và nghĩa tiếng Việt.');
        return;
      }

      const newWordData = {
        word,
        ipa: elements.inputVocabIpa.value.trim() || `/${word.toLowerCase()}/`,
        meaning,
        example_en: elements.inputVocabExampleEn.value.trim() || `I use ${word} in daily conversation.`,
        example_vi: elements.inputVocabExampleVi.value.trim() || '',
        mnemonic: elements.inputVocabMnemonic.value.trim() || '',
        level: 'A1-Daily'
      };

      try {
        const res = await addCustomWord(newWordData);
        if (res.success && res.item) {
          state.vocabulary.unshift(res.item);
          updateVocabStatsUI();
          renderVocabularyView();
          elements.addVocabModal.classList.remove('active');
          alert(`Đã thêm thành công từ "${word}" vào kho từ vựng!`);
        }
      } catch (e) {
        alert(`Không thể lưu từ vựng: ${e.message}`);
      }
    });
  }

  // Quiz Modal Logic
  if (elements.btnOpenVocabQuiz) {
    elements.btnOpenVocabQuiz.addEventListener('click', startVocabQuiz);
  }
  if (elements.vocabQuizClose) elements.vocabQuizClose.onclick = () => elements.vocabQuizModal.classList.remove('active');
  if (elements.btnCloseQuiz) elements.btnCloseQuiz.onclick = () => elements.vocabQuizModal.classList.remove('active');

  // Settings Modal
  elements.settingsBtn.addEventListener('click', () => {
    elements.apiKeyInput.value = state.apiKey;
    if (elements.modelSelect) {
      elements.modelSelect.value = state.activeModel || 'gemini-3.8-flash';
    }
    elements.settingsModal.classList.add('active');
  });

  elements.settingsClose.addEventListener('click', () => {
    elements.settingsModal.classList.remove('active');
  });

  elements.settingsSave.addEventListener('click', async () => {
    const key = elements.apiKeyInput.value.trim();
    const model = elements.modelSelect ? elements.modelSelect.value : state.activeModel;
    if (key) setApiKey(key);
    if (model) setModel(model);
    await saveServerApiKey(key, model);
    if (key) updateApiStatusUI(true);
    elements.settingsModal.classList.remove('active');
  });

  // Mistakes Modal
  elements.mistakesBtn.addEventListener('click', () => {
    renderMistakesList();
    elements.mistakesModal.classList.add('active');
  });

  if (elements.mistakesClose) elements.mistakesClose.onclick = () => elements.mistakesModal.classList.remove('active');
  if (elements.mistakesFooterClose) elements.mistakesFooterClose.onclick = () => elements.mistakesModal.classList.remove('active');

  // Real-time Grammarly typing check
  elements.englishInput.addEventListener('input', () => {
    triggerQuickCheckDebounced(false);
  });

  // Create Topic Modal
  if (elements.btnCreateTopicModal) {
    elements.btnCreateTopicModal.addEventListener('click', () => {
      elements.newTopicName.value = '';
      elements.createTopicStatus.style.display = 'none';
      elements.createTopicModal.classList.add('active');
      elements.newTopicName.focus();
    });
  }

  if (elements.createTopicClose) elements.createTopicClose.onclick = () => elements.createTopicModal.classList.remove('active');
  if (elements.createTopicCancel) elements.createTopicCancel.onclick = () => elements.createTopicModal.classList.remove('active');

  if (elements.btnSubmitCreateTopic) {
    elements.btnSubmitCreateTopic.addEventListener('click', async () => {
      const topicName = elements.newTopicName.value.trim();
      if (!topicName) return;

      const categoryRadio = document.querySelector('input[name="topic-category"]:checked');
      const category = categoryRadio ? categoryRadio.value : 'tech';

      elements.btnSubmitCreateTopic.disabled = true;
      elements.createTopicStatus.style.display = 'block';
      elements.createTopicStatus.style.color = '#38bdf8';
      elements.createTopicStatus.textContent = '⏳ Gemini đang thiết kế bộ 10 câu tình huống thực tế...';

      try {
        const res = await createCustomTopic({
          topicName,
          category,
          count: 10,
          customApiKey: state.apiKey || null
        });

        if (res.success && res.topic) {
          state.topics.unshift(res.topic);
          elements.createTopicModal.classList.remove('active');
          selectTopic(res.topic.id);
          renderTopics();
          alert(`Đã tạo thành công chủ đề mới "${res.topic.name}" với ${res.topic.sentences.length} câu tình huống!`);
        }
      } catch (err) {
        elements.createTopicStatus.style.color = '#fb7185';
        elements.createTopicStatus.textContent = `Lỗi: ${err.message}`;
      } finally {
        elements.btnSubmitCreateTopic.disabled = false;
      }
    });
  }

  // Keyboard Shortcuts:
  // - Enter submits in practice input
  // - Space flips flashcard when in vocabulary view
  // - 1, 2, 3, 4 rates SRS
  document.addEventListener('keydown', (e) => {
    // If inside text input, only check Enter
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Enter' && !e.shiftKey && e.target === elements.englishInput) {
        e.preventDefault();
        handleCheckAnswer();
      }
      return;
    }

    if (state.currentTab === 'vocabulary') {
      if (e.code === 'Space') {
        e.preventDefault();
        flipFlashcard();
      } else if (e.key === '1') {
        handleSrsGrade(0); // Again
      } else if (e.key === '2') {
        handleSrsGrade(1); // Hard
      } else if (e.key === '3') {
        handleSrsGrade(2); // Good
      } else if (e.key === '4') {
        handleSrsGrade(3); // Easy
      }
    }
  });
}

// ==========================================================================
// QUIZ GAME ENGINE
// ==========================================================================
let quizCurrentIndex = 0;
let quizScore = 0;
let quizQuestions = [];

function startVocabQuiz() {
  const all = state.vocabulary || [];
  if (all.length < 4) {
    alert('Cần có ít nhất 4 từ vựng trong kho để bắt đầu Quiz!');
    return;
  }

  quizCurrentIndex = 0;
  quizScore = 0;
  quizQuestions = [...all].sort(() => Math.random() - 0.5).slice(0, 5);
  
  elements.vocabQuizModal.classList.add('active');
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (quizCurrentIndex >= quizQuestions.length) {
    // Quiz finished
    elements.quizQuestionCounter.textContent = 'Hoàn thành!';
    elements.quizTargetWord.textContent = `🎉 Điểm của bạn: ${quizScore} / ${quizQuestions.length}`;
    elements.quizTargetIpa.textContent = 'Luyện tập mỗi ngày giúp nhớ từ vựng sâu hơn!';
    elements.quizOptionsGrid.innerHTML = '';
    elements.quizFeedbackBox.style.display = 'none';
    elements.btnNextQuiz.style.display = 'none';
    return;
  }

  const currentWord = quizQuestions[quizCurrentIndex];
  elements.quizQuestionCounter.textContent = `Câu ${quizCurrentIndex + 1} / ${quizQuestions.length}`;
  elements.quizScorePill.textContent = `Điểm: ${quizScore}`;
  elements.quizTargetWord.textContent = currentWord.word;
  elements.quizTargetIpa.textContent = currentWord.ipa || `/${currentWord.word.toLowerCase()}/`;
  elements.quizFeedbackBox.style.display = 'none';
  elements.btnNextQuiz.style.display = 'none';

  // Generate 4 options (1 correct + 3 random distractors) fast O(1)
  const all = state.vocabulary || [];
  const otherMeanings = [];
  const maxAttempts = 40;
  let attempts = 0;
  while (otherMeanings.length < 3 && attempts < maxAttempts && all.length > 3) {
    attempts++;
    const randWord = all[Math.floor(Math.random() * all.length)];
    if (randWord && randWord.id !== currentWord.id && randWord.meaning && randWord.meaning !== currentWord.meaning && !otherMeanings.includes(randWord.meaning)) {
      otherMeanings.push(randWord.meaning);
    }
  }

  const options = [
    { text: currentWord.meaning, isCorrect: true },
    { text: otherMeanings[0] || 'máy tính', isCorrect: false },
    { text: otherMeanings[1] || 'giúp đỡ', isCorrect: false },
    { text: otherMeanings[2] || 'hôm nay', isCorrect: false }
  ];
  options.sort(() => Math.random() - 0.5);

  elements.quizOptionsGrid.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      // Disable all options
      const btns = elements.quizOptionsGrid.querySelectorAll('.quiz-opt-btn');
      btns.forEach(b => b.disabled = true);

      if (opt.isCorrect) {
        btn.classList.add('correct');
        quizScore++;
        elements.quizScorePill.textContent = `Điểm: ${quizScore}`;
        elements.quizFeedbackBox.style.display = 'block';
        elements.quizFeedbackBox.style.background = 'rgba(16, 185, 129, 0.2)';
        elements.quizFeedbackBox.style.color = '#34d399';
        elements.quizFeedbackBox.textContent = '🎉 Chính xác! Bạn nhớ từ rất tốt.';
      } else {
        btn.classList.add('wrong');
        elements.quizFeedbackBox.style.display = 'block';
        elements.quizFeedbackBox.style.background = 'rgba(239, 68, 68, 0.2)';
        elements.quizFeedbackBox.style.color = '#fb7185';
        elements.quizFeedbackBox.textContent = `Chưa đúng! Đáp án đúng là: "${currentWord.meaning}".`;
      }

      elements.btnNextQuiz.style.display = 'inline-flex';
      elements.btnNextQuiz.onclick = () => {
        quizCurrentIndex++;
        renderQuizQuestion();
      };
    });
    elements.quizOptionsGrid.appendChild(btn);
  });
}

// ==========================================================================
// SPEECH ENGINE & UTILITIES
// ==========================================================================
function setupSpeechEngine() {
  initSpeechRecognition({
    onStart: () => {
      elements.micBtn.classList.add('recording');
      elements.voiceStatusBar.classList.add('active');
    },
    onResult: (transcript, isFinal) => {
      elements.englishInput.value = transcript;
      triggerQuickCheckDebounced(isFinal);
    },
    onError: (err) => {
      console.warn('Speech recognition warning:', err);
      elements.micBtn.classList.remove('recording');
      elements.voiceStatusBar.classList.remove('active');
    },
    onEnd: () => {
      elements.micBtn.classList.remove('recording');
      elements.voiceStatusBar.classList.remove('active');
      triggerQuickCheckDebounced(true);
    }
  });
}

function updateHeaderStats() {
  if (elements.streakCount) elements.streakCount.textContent = `${state.streak} Ngày`;
  if (elements.dailyProgressCount) elements.dailyProgressCount.textContent = `${state.todayCompleted}/10 Câu`;
}

function updateApiStatusUI(hasKey) {
  if (!elements.apiStatusNotice) return;
  if (hasKey) {
    elements.apiStatusNotice.textContent = '🟢 Gemini API Key đã được kích hoạt thành công.';
    elements.apiStatusNotice.style.color = '#34d399';
  } else {
    elements.apiStatusNotice.textContent = '⚠️ Chưa có API Key. Bấm vào đây để cài đặt hoặc thêm vào file .env';
    elements.apiStatusNotice.style.color = '#fbbf24';
  }
}

function renderMistakesList() {
  if (!elements.mistakesList) return;
  elements.mistakesList.innerHTML = '';
  if (!state.mistakes || state.mistakes.length === 0) {
    if (elements.mistakesEmpty) elements.mistakesEmpty.style.display = 'block';
    return;
  }
  if (elements.mistakesEmpty) elements.mistakesEmpty.style.display = 'none';

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// VIEW 4: AI VOICE ROLEPLAY ARENA CONTROLLER
// ==========================================================================
let roleplayRecognizer = null;

async function initRoleplayArena() {
  if (!state.roleplay.scenarios || state.roleplay.scenarios.length === 0) {
    try {
      state.roleplay.scenarios = await fetchRoleplayScenarios();
    } catch (err) {
      console.error('Failed to load roleplay scenarios:', err);
    }
  }

  // Populate scenario select
  if (elements.roleplayScenarioSelect && elements.roleplayScenarioSelect.children.length === 0) {
    (state.roleplay.scenarios || []).forEach(sc => {
      const opt = document.createElement('option');
      opt.value = sc.id;
      opt.textContent = `${sc.icon} ${sc.title} (${sc.badge})`;
      elements.roleplayScenarioSelect.appendChild(opt);
    });
    elements.roleplayScenarioSelect.value = state.roleplay.activeScenarioId;
    elements.roleplayScenarioSelect.onchange = (e) => {
      changeRoleplayScenario(e.target.value);
    };
  }

  updateActiveScenarioCard();

  // If no messages, seed initial message from AI
  if (!state.roleplay.messages || state.roleplay.messages.length === 0) {
    const curSc = getActiveScenario();
    if (curSc) {
      state.roleplay.messages = [
        { role: 'ai', content: curSc.opening_line }
      ];
    }
  }
  renderRoleplayMessages();
  setupRoleplayEventListeners();
}

function getActiveScenario() {
  return (state.roleplay.scenarios || []).find(s => s.id === state.roleplay.activeScenarioId) || (state.roleplay.scenarios || [])[0];
}

function updateActiveScenarioCard() {
  const sc = getActiveScenario();
  if (!sc) return;
  if (elements.scCardIcon) elements.scCardIcon.textContent = sc.icon || '💼';
  if (elements.scCardBadge) elements.scCardBadge.textContent = sc.badge || 'Công nghệ';
  if (elements.scCardRole) elements.scCardRole.textContent = sc.ai_role || 'AI Coach';
  if (elements.scCardTitle) elements.scCardTitle.textContent = sc.title || 'Roleplay';
  if (elements.scCardDesc) elements.scCardDesc.textContent = sc.description || '';
}

function changeRoleplayScenario(newScenarioId) {
  state.roleplay.activeScenarioId = newScenarioId;
  state.roleplay.messages = [];
  updateActiveScenarioCard();
  const sc = getActiveScenario();
  if (sc) {
    state.roleplay.messages = [{ role: 'ai', content: sc.opening_line }];
    speakText(sc.opening_line, 1.0);
  }
  renderRoleplayMessages();
}

function renderRoleplayMessages() {
  if (!elements.roleplayMessagesStream) return;
  elements.roleplayMessagesStream.innerHTML = '';
  const sc = getActiveScenario();
  const aiRoleName = sc ? sc.ai_role : 'AI';

  (state.roleplay.messages || []).forEach(msg => {
    const wrap = document.createElement('div');
    wrap.className = `chat-bubble-wrap ${msg.role}`;
    const isAi = msg.role === 'ai';

    wrap.innerHTML = `
      <div class="chat-avatar">${isAi ? '🤖' : '👤'}</div>
      <div class="chat-bubble-content">
        <div class="chat-sender-name">${isAi ? escapeHtml(aiRoleName) : 'Bạn'}</div>
        <div class="chat-bubble-text">${escapeHtml(msg.content)}</div>
        ${isAi ? `
          <div class="chat-bubble-actions">
            <button class="btn-bubble-speak" title="Nghe lại câu nói này">
              <span>🔊 Nghe giọng AI</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    if (isAi) {
      const speakBtn = wrap.querySelector('.btn-bubble-speak');
      if (speakBtn) {
        speakBtn.onclick = () => speakText(msg.content, 1.0);
      }
    }
    elements.roleplayMessagesStream.appendChild(wrap);
  });

  elements.roleplayMessagesStream.scrollTop = elements.roleplayMessagesStream.scrollHeight;
}

async function handleRoleplaySendMessage() {
  if (!elements.roleplayTextInput) return;
  const text = elements.roleplayTextInput.value.trim();
  if (!text) return;
  elements.roleplayTextInput.value = '';

  state.roleplay.messages.push({ role: 'user', content: text });
  renderRoleplayMessages();

  // Typing indicator
  const typingWrap = document.createElement('div');
  typingWrap.className = 'chat-bubble-wrap ai';
  typingWrap.id = 'roleplay-typing-indicator';
  typingWrap.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble-content">
      <div class="chat-bubble-text" style="font-style: italic; color: var(--text-muted);">
        Đang suy nghĩ câu trả lời... 💭
      </div>
    </div>
  `;
  elements.roleplayMessagesStream.appendChild(typingWrap);
  elements.roleplayMessagesStream.scrollTop = elements.roleplayMessagesStream.scrollHeight;

  try {
    const res = await sendRoleplayChat(
      state.roleplay.activeScenarioId,
      state.roleplay.messages,
      text,
      state.apiKey
    );
    const indicator = document.getElementById('roleplay-typing-indicator');
    if (indicator) indicator.remove();

    if (res && res.reply) {
      state.roleplay.messages.push({ role: 'ai', content: res.reply });
      renderRoleplayMessages();
      speakText(res.reply, 1.0);
    }
  } catch (err) {
    const indicator = document.getElementById('roleplay-typing-indicator');
    if (indicator) indicator.remove();
    console.error('Roleplay chat error:', err);
  }
}

function handleRoleplayVoiceToggle() {
  if (state.roleplay.isRecording) {
    if (roleplayRecognizer) {
      roleplayRecognizer.stop();
    }
    state.roleplay.isRecording = false;
    updateRoleplayVoiceButton(false);
    return;
  }

  roleplayRecognizer = createVoiceRecognizer({
    onStart: () => {
      state.roleplay.isRecording = true;
      updateRoleplayVoiceButton(true);
    },
    onEnd: () => {
      state.roleplay.isRecording = false;
      updateRoleplayVoiceButton(false);
    },
    onError: (err) => {
      state.roleplay.isRecording = false;
      updateRoleplayVoiceButton(false);
      console.warn('Roleplay voice error:', err);
    },
    onResult: (transcript, isFinal) => {
      if (elements.roleplayTextInput) {
        elements.roleplayTextInput.value = transcript;
      }
      if (isFinal) {
        state.roleplay.isRecording = false;
        updateRoleplayVoiceButton(false);
        handleRoleplaySendMessage();
      }
    }
  });

  if (roleplayRecognizer) {
    try {
      roleplayRecognizer.start();
    } catch (e) {
      console.warn(e);
    }
  }
}

function updateRoleplayVoiceButton(isRec) {
  if (!elements.btnRoleplayVoice) return;
  if (isRec) {
    elements.btnRoleplayVoice.classList.add('recording');
    elements.btnRoleplayVoice.innerHTML = '<span class="mic-icon">🔴</span><span class="mic-label">Đang nghe...</span>';
  } else {
    elements.btnRoleplayVoice.classList.remove('recording');
    elements.btnRoleplayVoice.innerHTML = '<span class="mic-icon">🎙️</span><span class="mic-label">Bấm để nói</span>';
  }
}

async function handleRoleplayFinish() {
  if (!state.roleplay.messages || state.roleplay.messages.length < 2) {
    alert('Hãy đối đáp ít nhất 1-2 câu trước khi nhận báo cáo đánh giá!');
    return;
  }

  if (elements.btnRoleplayFinish) {
    elements.btnRoleplayFinish.textContent = '⏳ Đang phân tích...';
    elements.btnRoleplayFinish.disabled = true;
  }

  try {
    const debrief = await fetchRoleplayDebrief(
      state.roleplay.activeScenarioId,
      state.roleplay.messages,
      state.apiKey
    );
    state.roleplay.debriefReport = debrief;
    renderDebriefModal(debrief);
    elements.roleplayDebriefModal.classList.add('active');
  } catch (err) {
    alert('Không thể tạo báo cáo đánh giá: ' + err.message);
  } finally {
    if (elements.btnRoleplayFinish) {
      elements.btnRoleplayFinish.innerHTML = '<span>📊 Kết thúc &amp; Xem báo cáo</span>';
      elements.btnRoleplayFinish.disabled = false;
    }
  }
}

function renderDebriefModal(data) {
  if (!data) return;
  if (elements.debriefScore) elements.debriefScore.textContent = data.overall_score || 80;
  if (elements.debriefLevel) elements.debriefLevel.textContent = data.fluency_level || 'B1 - Intermediate';
  if (elements.debriefSummary) elements.debriefSummary.textContent = data.summary || 'Hoàn thành tốt.';

  // Corrections
  if (elements.debriefCorrectionsList) {
    elements.debriefCorrectionsList.innerHTML = '';
    (data.grammar_corrections || []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'debrief-item-card';
      card.innerHTML = `
        <div class="debrief-original">${escapeHtml(item.original || '')}</div>
        <div class="debrief-improved">✨ ${escapeHtml(item.improved || '')}</div>
        <div class="debrief-note">${escapeHtml(item.explanation || '')}</div>
      `;
      elements.debriefCorrectionsList.appendChild(card);
    });
    if (!data.grammar_corrections || data.grammar_corrections.length === 0) {
      elements.debriefCorrectionsList.innerHTML = '<div style="color: #34d399; font-size: 0.9rem;">🎉 Xuất sắc! Không phát hiện lỗi ngữ pháp nghiêm trọng nào.</div>';
    }
  }

  // Upgrades
  if (elements.debriefUpgradesList) {
    elements.debriefUpgradesList.innerHTML = '';
    (data.native_upgrades || []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'debrief-item-card';
      card.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted);">Cách nói cơ bản: <span style="text-decoration: underline;">${escapeHtml(item.formal_or_basic || '')}</span></div>
        <div class="debrief-improved">🚀 Chuẩn bản ngữ: ${escapeHtml(item.native_expression || '')}</div>
        ${item.benefit ? `<div class="debrief-note">${escapeHtml(item.benefit)}</div>` : ''}
      `;
      elements.debriefUpgradesList.appendChild(card);
    });
  }

  // Tech Tags
  if (elements.debriefTechTags) {
    elements.debriefTechTags.innerHTML = '';
    (data.tech_terms_used || []).forEach(term => {
      const tag = document.createElement('span');
      tag.className = 'tech-tag';
      tag.textContent = term;
      elements.debriefTechTags.appendChild(tag);
    });
  }
}

let roleplayEventsBound = false;
function setupRoleplayEventListeners() {
  if (roleplayEventsBound) return;
  roleplayEventsBound = true;

  if (elements.btnRoleplaySend) {
    elements.btnRoleplaySend.addEventListener('click', handleRoleplaySendMessage);
  }
  if (elements.roleplayTextInput) {
    elements.roleplayTextInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRoleplaySendMessage();
    });
  }
  if (elements.btnRoleplayVoice) {
    elements.btnRoleplayVoice.addEventListener('click', handleRoleplayVoiceToggle);
  }
  if (elements.btnRoleplayFinish) {
    elements.btnRoleplayFinish.addEventListener('click', handleRoleplayFinish);
  }
  if (elements.roleplayDebriefClose) {
    elements.roleplayDebriefClose.addEventListener('click', () => {
      elements.roleplayDebriefModal.classList.remove('active');
    });
  }
  if (elements.btnCloseDebrief) {
    elements.btnCloseDebrief.addEventListener('click', () => {
      elements.roleplayDebriefModal.classList.remove('active');
    });
  }
  if (elements.btnRestartRoleplay) {
    elements.btnRestartRoleplay.addEventListener('click', () => {
      elements.roleplayDebriefModal.classList.remove('active');
      changeRoleplayScenario(state.roleplay.activeScenarioId);
    });
  }
}

// ==========================================================================
// FEATURE 2: AI SMART CONTEXTUAL STORY GENERATOR
// ==========================================================================
let storyBilingualVisible = true;

function setupStoryGeneratorEvents() {
  if (elements.btnOpenStoryGen) {
    elements.btnOpenStoryGen.addEventListener('click', openStoryGeneratorModal);
  }
  if (elements.storyGenClose) {
    elements.storyGenClose.addEventListener('click', () => {
      elements.storyGenModal.classList.remove('active');
    });
  }
  if (elements.btnCloseStoryModal) {
    elements.btnCloseStoryModal.addEventListener('click', () => {
      elements.storyGenModal.classList.remove('active');
    });
  }
  if (elements.btnRunStoryGen) {
    elements.btnRunStoryGen.addEventListener('click', handleRunStoryGen);
  }
  if (elements.btnToggleBilingual) {
    elements.btnToggleBilingual.addEventListener('click', () => {
      storyBilingualVisible = !storyBilingualVisible;
      if (elements.storyContentVi) {
        elements.storyContentVi.style.display = storyBilingualVisible ? 'block' : 'none';
      }
    });
  }
  if (elements.btnPlayStoryAudio) {
    elements.btnPlayStoryAudio.addEventListener('click', () => {
      if (state.story.currentStory && state.story.currentStory.content_en) {
        speakText(state.story.currentStory.content_en, 1.0);
      }
    });
  }
}

function openStoryGeneratorModal() {
  // Select target words from SRS due / again or active vocabulary
  const allVocab = state.vocabulary || [];
  let targetWords = allVocab.filter(w => (w.srs_stage === 0 || w.is_due));
  if (targetWords.length < 5) {
    const list = getFilteredVocabList();
    targetWords = list.slice(0, 8);
  } else {
    targetWords = targetWords.slice(0, 8);
  }

  state.story.targetWords = targetWords.map(w => w.word);

  if (elements.storyTargetWordsPills) {
    elements.storyTargetWordsPills.innerHTML = '';
    state.story.targetWords.forEach(word => {
      const pill = document.createElement('span');
      pill.className = 'story-word-pill';
      pill.textContent = `📌 ${word}`;
      elements.storyTargetWordsPills.appendChild(pill);
    });
  }

  if (elements.storyResultCard) elements.storyResultCard.style.display = 'none';
  if (elements.storyGenStatus) elements.storyGenStatus.style.display = 'none';
  if (elements.storyGenModal) elements.storyGenModal.classList.add('active');
}

async function handleRunStoryGen() {
  if (!state.story.targetWords || state.story.targetWords.length === 0) {
    alert('Không tìm thấy từ vựng mục tiêu để sáng tác truyện.');
    return;
  }

  if (elements.btnRunStoryGen) {
    elements.btnRunStoryGen.disabled = true;
  }
  if (elements.storyGenStatus) {
    elements.storyGenStatus.style.display = 'block';
  }

  try {
    const story = await generateVocabStory(state.story.targetWords, 'tech_workplace', state.apiKey);
    state.story.currentStory = story;
    renderStoryResult(story);
  } catch (err) {
    alert('Lỗi sáng tác truyện: ' + err.message);
  } finally {
    if (elements.btnRunStoryGen) elements.btnRunStoryGen.disabled = false;
    if (elements.storyGenStatus) elements.storyGenStatus.style.display = 'none';
  }
}

function renderStoryResult(story) {
  if (!story || !elements.storyResultCard) return;

  if (elements.storyTitleEn) elements.storyTitleEn.textContent = story.title_en || 'Short Story';
  if (elements.storyTitleVi) elements.storyTitleVi.textContent = story.title_vi || 'Truyện Ngắn Ngữ Cảnh';

  // Highlight target words in English story
  if (elements.storyContentEn) {
    let rawContent = escapeHtml(story.content_en || '');
    (story.target_words_included || state.story.targetWords || []).forEach(tw => {
      const reg = new RegExp(`\\b(${tw})\\b`, 'gi');
      rawContent = rawContent.replace(reg, '<span class="story-highlight-word">$1</span>');
    });
    elements.storyContentEn.innerHTML = rawContent;
  }

  if (elements.storyContentVi) {
    elements.storyContentVi.textContent = story.content_vi || '';
    elements.storyContentVi.style.display = 'block';
    storyBilingualVisible = true;
  }

  // Mini comprehension quiz
  if (elements.storyQuizSection && elements.storyQuizList) {
    elements.storyQuizList.innerHTML = '';
    const quizzes = story.comprehension_quiz || [];
    if (quizzes.length > 0) {
      elements.storyQuizSection.style.display = 'block';
      quizzes.forEach((q, idx) => {
        const qCard = document.createElement('div');
        qCard.className = 'story-quiz-card';
        qCard.innerHTML = `
          <div class="story-quiz-q">Câu hỏi ${idx + 1}: ${escapeHtml(q.question)}</div>
          <div class="quiz-options"></div>
          <div class="quiz-explanation">${escapeHtml(q.explanation || '')}</div>
        `;
        const optsContainer = qCard.querySelector('.quiz-options');
        const explBox = qCard.querySelector('.quiz-explanation');

        (q.options || []).forEach(opt => {
          const optBtn = document.createElement('button');
          optBtn.className = 'quiz-option-btn';
          optBtn.textContent = opt;
          optBtn.addEventListener('click', () => {
            const allBtns = optsContainer.querySelectorAll('.quiz-option-btn');
            allBtns.forEach(b => b.disabled = true);
            if (opt === q.correct_answer) {
              optBtn.classList.add('correct');
            } else {
              optBtn.classList.add('wrong');
              allBtns.forEach(b => {
                if (b.textContent === q.correct_answer) b.classList.add('correct');
              });
            }
            explBox.style.display = 'block';
          });
          optsContainer.appendChild(optBtn);
        });

        elements.storyQuizList.appendChild(qCard);
      });
    } else {
      elements.storyQuizSection.style.display = 'none';
    }
  }

  elements.storyResultCard.style.display = 'flex';
}

// ==========================================================================
// FEATURE 3: PRONUNCIATION DIAGNOSTICS DIFF & MULTI-SPEED SHADOWING
// ==========================================================================
function setupPronunciationShadowingEvents() {
  // Shadowing speed buttons
  const rateBtns = document.querySelectorAll('.shadowing-rates .btn-rate');
  rateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const rate = parseFloat(btn.dataset.rate) || 1.0;
      state.pronunciation.shadowingRate = rate;
    });
  });

  // Replay shadowing button
  if (elements.btnReplayShadowing) {
    elements.btnReplayShadowing.addEventListener('click', () => {
      const sentenceToSpeak = (elements.correctedText && elements.correctedText.textContent) 
        || (getCurrentSentence() ? getCurrentSentence().english : '');
      if (sentenceToSpeak) {
        speakText(sentenceToSpeak, state.pronunciation.shadowingRate || 1.0);
      }
    });
  }
}

async function handlePronunciationDiffEvaluation(targetSentence, spokenText) {
  if (!elements.pronunChipsContainer) return;

  if (!spokenText || !targetSentence) {
    elements.pronunChipsContainer.innerHTML = '<span class="pronun-tip-init">Hãy bấm micro nói câu tiếng Anh ở trên để hệ thống tự động soi chi tiết từng từ &amp; âm đuôi.</span>';
    if (elements.pronunScoreBadge) {
      elements.pronunScoreBadge.textContent = 'Điểm: --';
      elements.pronunScoreBadge.className = 'pronun-score-badge';
    }
    return;
  }

  elements.pronunChipsContainer.innerHTML = '<span class="pronun-tip-init" style="color: var(--accent-cyan);">⏳ Đang soi chi tiết từng âm đuôi...</span>';

  try {
    const analysis = await evaluatePronunciation(targetSentence, spokenText, state.apiKey);
    renderPronunciationDiff(analysis);
  } catch (err) {
    console.warn('Pronunciation diff error:', err);
    elements.pronunChipsContainer.innerHTML = `<span class="pronun-tip-init" style="color: #f87171;">Không thể phân tích: ${escapeHtml(err.message)}</span>`;
  }
}

function renderPronunciationDiff(analysis) {
  if (!analysis || !elements.pronunChipsContainer) return;

  const score = analysis.pronunciation_score || 0;
  if (elements.pronunScoreBadge) {
    elements.pronunScoreBadge.textContent = `Điểm: ${score}%`;
    elements.pronunScoreBadge.className = 'pronun-score-badge';
    if (score >= 80) elements.pronunScoreBadge.classList.add('high');
    else if (score >= 60) elements.pronunScoreBadge.classList.add('medium');
    else elements.pronunScoreBadge.classList.add('low');
  }

  elements.pronunChipsContainer.innerHTML = '';
  const words = analysis.words || [];

  if (words.length === 0) {
    elements.pronunChipsContainer.innerHTML = '<span class="pronun-tip-init">Không có từ nào được phát hiện.</span>';
    return;
  }

  words.forEach(w => {
    const chip = document.createElement('div');
    const status = w.status || 'correct';
    const statusClass = status === 'correct' ? 'chip-correct' : (status === 'minor_issue' ? 'chip-warning' : 'chip-error');
    chip.className = `pronun-chip ${statusClass}`;

    const tagText = status === 'correct' ? '✓ chuẩn' : (w.detail || status);
    chip.innerHTML = `
      <span class="chip-word">${escapeHtml(w.word)}</span>
      <span class="chip-tag">${escapeHtml(tagText)}</span>
    `;
    elements.pronunChipsContainer.appendChild(chip);
  });
}

// ==========================================================================
// FEATURE 4: INSTANT AI EXPLAIN ASSISTANT (FLOATING DRAWER)
// ==========================================================================
function setupFloatingAssistantEvents() {
  if (elements.btnFloatingAssistant) {
    elements.btnFloatingAssistant.addEventListener('click', () => {
      toggleAssistantDrawer(true);
    });
  }

  if (elements.assistantDrawerClose) {
    elements.assistantDrawerClose.addEventListener('click', () => {
      toggleAssistantDrawer(false);
    });
  }

  if (elements.btnAssistantSubmit) {
    elements.btnAssistantSubmit.addEventListener('click', () => {
      handleAssistantAsk();
    });
  }

  if (elements.assistantInputBox) {
    elements.assistantInputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAssistantAsk();
    });
  }

  // Quick Prompt buttons
  const quickBtns = document.querySelectorAll('.assistant-quick-prompts .quick-prompt-btn');
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      if (q) {
        if (elements.assistantInputBox) elements.assistantInputBox.value = q;
        handleAssistantAsk(q);
      }
    });
  });

  // Capture selected text across entire app
  document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    if (!selection) return;
    const selectedText = selection.toString().trim();
    if (selectedText && selectedText.length > 2 && selectedText.length < 100) {
      if (elements.assistantInputBox && !elements.assistantInputBox.value) {
        elements.assistantInputBox.placeholder = `Hỏi về: "${selectedText.slice(0, 25)}..."`;
        state.assistant.activeSelection = selectedText;
      }
    }
  });
}

function toggleAssistantDrawer(open) {
  state.assistant.isOpen = open;
  if (!elements.assistantDrawer) return;

  if (open) {
    elements.assistantDrawer.classList.add('open');
    if (state.assistant.activeSelection && elements.assistantInputBox) {
      elements.assistantInputBox.value = `Giải thích nghĩa và cách dùng từ/cụm từ "${state.assistant.activeSelection}"`;
      state.assistant.activeSelection = null;
    }
    if (elements.assistantInputBox) elements.assistantInputBox.focus();
  } else {
    elements.assistantDrawer.classList.remove('open');
  }
}

async function handleAssistantAsk(customQuestion) {
  const inputVal = customQuestion || (elements.assistantInputBox ? elements.assistantInputBox.value.trim() : '');
  if (!inputVal) return;

  if (elements.assistantInputBox) elements.assistantInputBox.value = '';

  // Render user question
  appendAssistantMessage('user', inputVal);

  // Render thinking indicator
  const thinkingId = 'assistant-thinking-' + Date.now();
  appendAssistantMessage('ai', 'Đang suy nghĩ câu trả lời... 💭', thinkingId);

  // Context gathering
  let context = '';
  if (state.currentTab === 'practice') {
    const curSent = getCurrentSentence();
    if (curSent) context = `Sentence context: English="${curSent.english}", Vietnamese="${curSent.vietnamese}"`;
  } else if (state.currentTab === 'vocabulary') {
    const list = getFilteredVocabList();
    const curV = list[state.currentVocabIndex];
    if (curV) context = `Vocab context: Word="${curV.word}", Meaning="${curV.meaning}"`;
  }

  try {
    const res = await askAiAssistant({
      question: inputVal,
      selectedText: state.assistant && state.assistant.activeSelection ? state.assistant.activeSelection : '',
      context: context,
      customApiKey: state.apiKey || ''
    });
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    if (res && (res.answer_vi || res.answer)) {
      let fullMessage = res.answer_vi || res.answer;
      if (res.examples && Array.isArray(res.examples) && res.examples.length > 0) {
        fullMessage += '\n\n**Ví dụ thực tế:**\n' + res.examples.map(ex => `• ${ex}`).join('\n');
      }
      if (res.tips) {
        fullMessage += `\n\n💡 **Mẹo ghi nhớ:** ${res.tips}`;
      }
      appendAssistantMessage('ai', fullMessage);
    } else {
      appendAssistantMessage('ai', 'Không nhận được câu trả lời từ AI. Vui lòng thử lại!');
    }
  } catch (err) {
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();
    appendAssistantMessage('ai', `⚠️ Không thể phản hồi: ${err.message}`);
  }
}

function appendAssistantMessage(role, text, id = null) {
  if (!elements.assistantMessagesStream) return;
  const wrap = document.createElement('div');
  wrap.className = `assistant-msg ${role}`;
  if (id) wrap.id = id;

  const isAi = role === 'ai';
  const formatted = escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  wrap.innerHTML = `
    <div class="msg-avatar">${isAi ? '💡' : '👤'}</div>
    <div class="msg-text">${formatted}</div>
  `;
  elements.assistantMessagesStream.appendChild(wrap);
  elements.assistantMessagesStream.scrollTop = elements.assistantMessagesStream.scrollHeight;
}

// Start App when DOM ready
document.addEventListener('DOMContentLoaded', initApp);
