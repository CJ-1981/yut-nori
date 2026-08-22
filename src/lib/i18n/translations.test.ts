import { describe, expect, it } from 'bun:test';
import { LANGUAGES, t, translations, type Language, type TranslationKey } from './translations';

describe('i18n translations module', () => {
  describe('LANGUAGES constant', () => {
    it('contains all supported language definitions', () => {
      const codes = LANGUAGES.map((l) => l.code);
      expect(codes).toEqual(['en', 'ko', 'ja', 'zh']);
    });

    it('each language has a non-empty code, label, and flag', () => {
      LANGUAGES.forEach((lang) => {
        expect(lang.code).toBeTruthy();
        expect(lang.label).toBeTruthy();
        expect(lang.flag).toBeTruthy();
      });
    });
  });

  describe('t() translation helper function', () => {
    it('returns standard translations for English ("en")', () => {
      expect(t('en', 'appTitle')).toBe('Yut Nori');
      expect(t('en', 'startGame')).toBe('Start Game');
      expect(t('en', 'yutDo')).toBe('Do');
    });

    it('returns standard translations for Korean ("ko")', () => {
      expect(t('ko', 'appTitle')).toBe('윷놀이');
      expect(t('ko', 'startGame')).toBe('게임 시작');
      expect(t('ko', 'yutDo')).toBe('도');
    });

    it('returns standard translations for Japanese ("ja")', () => {
      expect(t('ja', 'appTitle')).toBe('ユンノリ');
      expect(t('ja', 'startGame')).toBe('ゲーム開始');
      expect(t('ja', 'yutDo')).toBe('ド');
    });

    it('returns standard translations for Chinese ("zh")', () => {
      expect(t('zh', 'appTitle')).toBe('柶戏');
      expect(t('zh', 'startGame')).toBe('开始游戏');
      expect(t('zh', 'yutDo')).toBe('到');
    });

    it('falls back to English when an invalid or unsupported language is passed', () => {
      const invalidLang = 'fr' as Language;
      expect(t(invalidLang, 'appTitle')).toBe('Yut Nori');
      expect(t(invalidLang, 'startGame')).toBe('Start Game');
    });

    it('falls back to English key translation when key is missing in target dictionary', () => {
      // Temporarily delete a key in 'ko' object to simulate missing translation
      const originalKoValue = translations.ko.startGame;
      delete (translations.ko as Partial<Record<TranslationKey, string>>).startGame;

      try {
        expect(t('ko', 'startGame')).toBe('Start Game');
      } finally {
        translations.ko.startGame = originalKoValue;
      }
    });

    it('falls back to the key string itself when key is missing in all dictionaries', () => {
      const nonExistentKey = 'nonExistentKey' as TranslationKey;
      expect(t('en', nonExistentKey)).toBe('nonExistentKey');
      expect(t('ko', nonExistentKey)).toBe('nonExistentKey');
      expect(t('ja', nonExistentKey)).toBe('nonExistentKey');
      expect(t('zh', nonExistentKey)).toBe('nonExistentKey');
      expect(t('unsupported' as Language, nonExistentKey)).toBe('nonExistentKey');
    });
  });

  describe('Translation dictionary integrity', () => {
    it('ensures all keys present in English exist in all other languages', () => {
      const enKeys = Object.keys(translations.en) as TranslationKey[];
      const languages: Language[] = ['ko', 'ja', 'zh'];

      languages.forEach((lang) => {
        enKeys.forEach((key) => {
          const value = translations[lang][key];
          expect(value).toBeDefined();
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        });
      });
    });

    it('ensures all languages have the same number of keys as English', () => {
      const enKeyCount = Object.keys(translations.en).length;
      expect(Object.keys(translations.ko).length).toBe(enKeyCount);
      expect(Object.keys(translations.ja).length).toBe(enKeyCount);
      expect(Object.keys(translations.zh).length).toBe(enKeyCount);
    });
  });
});
