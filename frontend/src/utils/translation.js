import axios from 'axios';

class TranslationService {
  constructor() {
    this.apiBase = 'http://localhost:5000/api';
  }

  async translateText(text, targetLang, sourceLang = 'auto') {
    if (!text || targetLang === 'en') return text;
    
    if (text.trim().length < 2 || this.isMostlyEmojis(text)) {
      return text;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${this.apiBase}/translation/translate`,
        {
          text,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data.success) {
        return response.data.translatedText || text;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.warn('Backend translation failed:', error.message);
      return text;
    }
  }

  async detectLanguage(text) {
    if (!text || text.length < 2) return 'en';

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${this.apiBase}/translation/detect`,
        { text },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      if (response.data.success) {
        return response.data.detectedLanguage;
      } else {
        return this.basicLanguageDetection(text);
      }
    } catch (error) {
      console.warn('Language detection API failed:', error);
      return this.basicLanguageDetection(text);
    }
  }

  async getSupportedLanguages() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${this.apiBase}/translation/languages`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      if (response.data.success && Array.isArray(response.data.languages)) {
        return response.data.languages;
      }
      return this.getDefaultLanguages();
    } catch (error) {
      console.warn('Failed to get languages from backend:', error);
      return this.getDefaultLanguages();
    }
  }

  getDefaultLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
    ];
  }

  getFlagForLanguage(code) {
    const flagMap = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 
      'ja': '🇯🇵', 'zh': '🇨🇳', 'ar': '🇸🇦', 'ru': '🇷🇺',
      'pt': '🇵🇹', 'it': '🇮🇹', 'ko': '🇰🇷', 'tr': '🇹🇷',
      'hi': '🇮🇳', 'bn': '🇮🇳', 'te': '🇮🇳', 'mr': '🇮🇳',
      'ta': '🇮🇳', 'ur': '🇮🇳', 'gu': '🇮🇳', 'kn': '🇮🇳',
      'ml': '🇮🇳', 'pa': '🇮🇳'
    };
    return flagMap[code] || '🌐';
  }

  getLanguageName(code) {
    const languages = this.getDefaultLanguages();
    const lang = languages.find(l => l.code === code);
    return lang ? lang.nativeName : code;
  }

  isMostlyEmojis(text) {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    const emojiCount = (text.match(emojiRegex) || []).length;
    const textWithoutEmojis = text.replace(emojiRegex, '').trim();
    return textWithoutEmojis.length === 0 && emojiCount > 0;
  }

  basicLanguageDetection(text) {
    const sample = text.substring(0, 100);
    
    if (/[\u0900-\u097F]/.test(sample)) return 'hi';
    if (/[\u0980-\u09FF]/.test(sample)) return 'bn';
    if (/[\u0B80-\u0BFF]/.test(sample)) return 'ta';
    if (/[\u0C00-\u0C7F]/.test(sample)) return 'te';
    if (/[\u0A80-\u0AFF]/.test(sample)) return 'gu';
    if (/[\u0A00-\u0A7F]/.test(sample)) return 'pa';
    if (/[\u0600-\u06FF]/.test(sample)) return 'ur';
    
    return 'en';
  }
}

export const translationService = new TranslationService();
export default translationService;