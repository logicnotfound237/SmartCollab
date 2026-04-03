import { useState, useCallback, useRef } from 'react';
import { translationService } from '../utils/translation';

export const useTranslation = (userLanguage = 'en') => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState({});
  
  // Use ref for cache to avoid dependency issues and re-renders
  const translationCache = useRef(new Map());
  const pendingTranslations = useRef(new Map());

  // Helper function to clean translation response (as backup)
  const cleanTranslationResponse = useCallback((translated, original) => {
    if (!translated || translated === original) return original;
    
    // Remove metadata patterns like "([हिन्दी अनुवाद] text)"
    const patterns = [
      /\(\[[^\]]*\]\s*(.*)\)/, // Matches "([हिन्दी अनुवाद] text)"
      /^\[[^\]]*\]\s*(.*)/,    // Matches "[Hindi] text"
      /^.*?:\s*(.*)/,          // Matches "Translation: text"
    ];
    
    for (const pattern of patterns) {
      const match = translated.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return translated;
  }, []);

  const translateMessage = useCallback(async (message, targetLang = userLanguage) => {
    if (!message || !message.trim() || targetLang === 'en') {
      return message;
    }

    // Check cache first
    const cacheKey = `${message}-${targetLang}`;
    if (translationCache.current.has(cacheKey)) {
      return translationCache.current.get(cacheKey);
    }

    // Check if already translating this message
    if (pendingTranslations.current.has(cacheKey)) {
      return pendingTranslations.current.get(cacheKey);
    }

    setIsTranslating(true);
    
    // Create promise for this translation
    const translationPromise = (async () => {
      try {
        // Detect source language first
        const sourceLang = await translationService.detectLanguage(message);
        let translated = await translationService.translateText(message, targetLang, sourceLang);
        
        // DOUBLE CLEANING: Ensure any metadata is removed
        // The service should clean it, but this is a backup
        translated = cleanTranslationResponse(translated, message);
        
        // Cache the translation
        if (translated && translated !== message) {
          translationCache.current.set(cacheKey, translated);
        }
        
        // Remove from pending
        pendingTranslations.current.delete(cacheKey);
        
        return translated || message;
      } catch (error) {
        console.warn('Translation failed:', error);
        // Cache the original message to avoid retrying failed translations
        translationCache.current.set(cacheKey, message);
        pendingTranslations.current.delete(cacheKey);
        return message;
      }
    })();

    // Store the promise
    pendingTranslations.current.set(cacheKey, translationPromise);

    try {
      const result = await translationPromise;
      return result;
    } finally {
      // Check if all translations are done
      if (pendingTranslations.current.size === 0) {
        setIsTranslating(false);
      }
    }
  }, [userLanguage, cleanTranslationResponse]);

  const batchTranslateMessages = useCallback(async (messages, targetLang = userLanguage) => {
    if (targetLang === 'en') {
      return messages.reduce((acc, message) => {
        if (message?.id && message?.message) {
          acc[message.id] = message.message;
        }
        return acc;
      }, {});
    }

    setIsTranslating(true);
    
    try {
      const translations = {};
      const messagesToTranslate = [];
      
      // Separate cached and new messages
      messages.forEach(message => {
        if (!message?.message || !message?.id) return;
        
        const cacheKey = `${message.message}-${targetLang}`;
        if (translationCache.current.has(cacheKey)) {
          translations[message.id] = translationCache.current.get(cacheKey);
        } else {
          messagesToTranslate.push(message);
        }
      });

      // Translate new messages in batches
      if (messagesToTranslate.length > 0) {
        const batchResults = await Promise.allSettled(
          messagesToTranslate.map(async (message) => {
            try {
              const cacheKey = `${message.message}-${targetLang}`;
              const sourceLang = await translationService.detectLanguage(message.message);
              let translated = await translationService.translateText(
                message.message, 
                targetLang, 
                sourceLang
              );
              
              // Clean the translation response
              translated = cleanTranslationResponse(translated, message.message);
              
              if (translated && translated !== message.message) {
                translationCache.current.set(cacheKey, translated);
                return { id: message.id, translated };
              }
              return { id: message.id, translated: message.message };
            } catch (error) {
              console.warn(`Translation failed for message ${message.id}:`, error);
              return { id: message.id, translated: message.message };
            }
          })
        );

        // Process batch results
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            translations[result.value.id] = result.value.translated;
          }
        });
      }
      
      return translations;
    } catch (error) {
      console.error('Batch translation failed:', error);
      // Return original messages as fallback
      return messages.reduce((acc, message) => {
        if (message?.id && message?.message) {
          acc[message.id] = message.message;
        }
        return acc;
      }, {});
    } finally {
      setIsTranslating(false);
    }
  }, [userLanguage, cleanTranslationResponse]);

  const toggleOriginalView = useCallback((messageId) => {
    setShowOriginal(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  }, []);

  const getSupportedLanguages = useCallback(async () => {
    try {
      return await translationService.getSupportedLanguages();
    } catch (error) {
      console.warn('Failed to get supported languages:', error);
      // Return fallback languages
      return [
        { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
        { code: 'bn', name: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা' },
        { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
        { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
        { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
        { code: 'ur', name: 'Urdu', flag: '🇮🇳', nativeName: 'اردو' },
        { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
        { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' },
        { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം' },
        { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
        { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
        { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
        { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' }
      ];
    }
  }, []);

  const getLanguageName = useCallback((code) => {
    try {
      return translationService.getLanguageName(code);
    } catch (error) {
      console.warn('Failed to get language name:', error);
      return code;
    }
  }, []);

  const clearCache = useCallback(() => {
    translationCache.current = new Map();
    pendingTranslations.current = new Map();
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      cachedItems: translationCache.current.size,
      pendingItems: pendingTranslations.current.size
    };
  }, []);

  // Debug function to check what's happening with translations
  const debugTranslation = useCallback(async (text, targetLang = userLanguage) => {
    console.log('🔍 Translation Debug:');
    console.log('Input:', text);
    console.log('Target language:', targetLang);
    
    try {
      const sourceLang = await translationService.detectLanguage(text);
      console.log('Detected source language:', sourceLang);
      
      const rawTranslation = await translationService.translateText(text, targetLang, sourceLang);
      console.log('Raw translation from service:', rawTranslation);
      
      const cleaned = cleanTranslationResponse(rawTranslation, text);
      console.log('Cleaned translation:', cleaned);
      
      return cleaned;
    } catch (error) {
      console.error('Debug translation failed:', error);
      return text;
    }
  }, [userLanguage, cleanTranslationResponse]);

  return {
    isTranslating,
    showOriginal,
    translateMessage,
    batchTranslateMessages,
    toggleOriginalView,
    getSupportedLanguages,
    getLanguageName,
    clearCache,
    getCacheStats,
    debugTranslation // Added for debugging
  };
};