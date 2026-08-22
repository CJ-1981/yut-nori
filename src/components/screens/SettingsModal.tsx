'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game/store';
import { useI18n } from '@/lib/i18n/I18nContext';
import { LANGUAGES } from '@/lib/i18n/translations';
import { soundManager } from '@/lib/sound/sounds';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t, lang, setLang } = useI18n();
  const backDoAdvantage = useGameStore((s) => s.backDoAdvantage);
  const setBackDoAdvantage = useGameStore((s) => s.setBackDoAdvantage);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    soundManager.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    soundManager.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-stone-800 mb-4">{t('settings')}</h2>

        {/* Language */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-stone-700 mb-2 block">{t('language')}</label>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  soundManager.play('click');
                  setLang(l.code);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  lang === l.code
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound toggle */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-stone-700">
            🔊 {soundEnabled ? t('soundOn') : t('soundOff')}
          </span>
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
            }}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              soundEnabled ? 'bg-green-500' : 'bg-stone-300'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                soundEnabled ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Music toggle */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-stone-700">
            🎵 {musicEnabled ? t('musicOn') : t('musicOff')}
          </span>
          <button
            onClick={() => {
              if (!musicEnabled) soundManager.init();
              setMusicEnabled(!musicEnabled);
            }}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              musicEnabled ? 'bg-green-500' : 'bg-stone-300'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                musicEnabled ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Volume */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-stone-700 mb-2 block">
            {t('volume')}: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Back-Do Advantage toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1 pr-3">
            <div className="text-sm font-semibold text-stone-700">
              🔄 {t('backDoAdvantage')}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">{t('backDoAdvantageDesc')}</div>
          </div>
          <button
            onClick={() => {
              soundManager.play('click');
              setBackDoAdvantage(!backDoAdvantage);
            }}
            className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
              backDoAdvantage ? 'bg-green-500' : 'bg-stone-300'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                backDoAdvantage ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={() => {
            soundManager.play('click');
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-stone-800 text-white font-bold hover:bg-stone-900"
        >
          {t('confirm')}
        </button>
      </div>
    </div>
  );
}
