/**
 * API Client for Daily English AI Tutor (FastAPI backend)
 */

export async function fetchConfig() {
  const res = await fetch('/api/config');
  return res.json();
}

export async function saveServerApiKey(apiKey) {
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey })
  });
  return res.json();
}

export async function fetchTopics() {
  const res = await fetch('/api/topics');
  return res.json();
}

export async function fetchProgress() {
  const res = await fetch('/api/progress');
  return res.json();
}

export async function saveProgress({ date, completedIncrement = 1, score = 100, mistakeItem = null }) {
  const res = await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
