const express = require('express');
const router = express.Router();
const translationService = require('../services/translationService');
const auth = require('../middleware/auth');

// Translate text
router.post('/translate', auth, async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const translatedText = await translationService.translateText(
      text, 
      targetLanguage, 
      sourceLanguage
    );

    res.json({
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage,
      success: true
    });
  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      details: error.message 
    });
  }
});

// Detect language
router.post('/detect', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const detectedLanguage = await translationService.detectLanguage(text);

    res.json({
      text,
      detectedLanguage,
      success: true
    });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ 
      error: 'Language detection failed',
      details: error.message 
    });
  }
});

// Get supported languages
router.get('/languages', auth, (req, res) => {
  try {
    const languages = translationService.getSupportedLanguages();
    
    const indianLanguageCodes = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'pa'];
    const indianLanguages = languages.filter(lang => indianLanguageCodes.includes(lang.code));
    
    res.json({
      success: true,
      languages,
      indianLanguages
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ 
      error: 'Failed to get languages',
      details: error.message 
    });
  }
});

// Auto-translate message
router.post('/auto-translate', auth, async (req, res) => {
  try {
    const { message, preferredLanguage = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await translationService.autoTranslateMessage(message, preferredLanguage);

    res.json({
      ...result,
      success: true
    });
  } catch (error) {
    console.error('Auto-translate error:', error);
    res.status(500).json({ 
      error: 'Auto-translation failed',
      details: error.message 
    });
  }
});

module.exports = router;