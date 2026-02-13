// Auto-translate utility using free Google Translate API
// Caches translations in localStorage for performance

const CACHE_KEY = 'translate_cache';
const CACHE_VERSION = 1;

// Get cache from localStorage
const getCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed._v !== CACHE_VERSION) return {};
    return parsed;
  } catch {
    return {};
  }
};

// Save cache to localStorage
const saveCache = (cache) => {
  try {
    cache._v = CACHE_VERSION;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full, clear old cache
    localStorage.removeItem(CACHE_KEY);
  }
};

// Generate a short hash for cache key
const hashText = (text) => {
  let hash = 0;
  const str = text.substring(0, 200); // Only hash first 200 chars for speed
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'tr_' + Math.abs(hash).toString(36);
};

// Translate text from Indonesian to English
export const translateText = async (text, targetLang = 'en') => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) return text;
  if (targetLang === 'id') return text; // Already in Indonesian

  // Strip HTML for translation, but keep track for later
  const isHTML = /<[^>]+>/.test(text);

  // Check cache first
  const cache = getCache();
  const key = hashText(text);
  if (cache[key]) return cache[key];

  try {
    // Use Google Translate free endpoint
    const textToTranslate = isHTML ? text.replace(/<[^>]+>/g, ' ').trim() : text;

    // Only translate if text is reasonable length
    if (textToTranslate.length > 5000) {
      // For very long text, translate in chunks
      return await translateLongText(textToTranslate, targetLang);
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;

    const response = await fetch(url);
    if (!response.ok) return text;

    const data = await response.json();

    // Extract translated text from response
    let translated = '';
    if (data && data[0]) {
      translated = data[0].map(item => item[0]).join('');
    }

    if (!translated) return text;

    // Cache the result
    cache[key] = translated;
    saveCache(cache);

    return translated;
  } catch {
    return text; // Return original on error
  }
};

// Translate long text in chunks
const translateLongText = async (text, targetLang) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > 4000) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += ' ' + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const results = await Promise.all(
    chunks.map(chunk => translateText(chunk, targetLang))
  );

  return results.join(' ');
};

// Batch translate multiple texts at once (for efficiency)
export const translateBatch = async (texts, targetLang = 'en') => {
  if (targetLang === 'id') return texts;

  const results = await Promise.all(
    texts.map(text => translateText(text, targetLang))
  );

  return results;
};
