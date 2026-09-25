/**
 * Speech Module: Handles Speech-to-Text (Voice Input) and Text-to-Speech (Pronunciation/Shadowing)
 */

let recognition = null;
let isRecording = false;
let currentRate = 1.0;

export function isSpeechRecognitionSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function initSpeechRecognition({ onResult, onError, onStart, onEnd }) {
  if (!isSpeechRecognitionSupported()) {
    console.warn('SpeechRecognition API is not supported in this browser.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isRecording = true;
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    if (onResult && transcript) {
      onResult(transcript, Boolean(finalTranscript));
    }
  };

  recognition.onerror = (event) => {
    isRecording = false;
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    isRecording = false;
    if (onEnd) onEnd();
  };

  return recognition;
}

export function toggleRecording() {
  if (!recognition) return false;
  if (isRecording) {
    recognition.stop();
    return false;
  } else {
    try {
      recognition.start();
      return true;
    } catch (e) {
      console.error('Error starting recognition:', e);
      return false;
    }
  }
}

export function setSpeechRate(rate) {
  currentRate = parseFloat(rate) || 1.0;
}

export function getSpeechRate() {
  return currentRate;
}

export function speakText(text, rate = currentRate) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const cleanText = text.replace(/[*_#`]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'en-US';
  utterance.rate = rate;

  // Prioritize high-quality natural voices
  const voices = window.speechSynthesis.getVoices();
  const usVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en_US') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('Samantha')));
  if (usVoice) {
    utterance.voice = usVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function createVoiceRecognizer({ onResult, onStart, onEnd, onError }) {
  if (!isSpeechRecognitionSupported()) return null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  rec.continuous = false;
  rec.interimResults = true;
  if (onStart) rec.onstart = onStart;
  if (onEnd) rec.onend = onEnd;
  if (onError) rec.onerror = (e) => onError(e.error);
  rec.onresult = (event) => {
    let text = '';
    let isFinal = false;
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      text += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    if (onResult && text) onResult(text, isFinal);
  };
  return rec;
}

