'use client';

import { useGameStore } from '@/lib/game/store';
import { useI18n } from '@/lib/i18n/I18nContext';
import { LANGUAGES } from '@/lib/i18n/translations';
import { soundManager } from '@/lib/sound/sounds';
import { useState, useEffect } from 'react';

export function MainMenu() {
  const { t, lang, setLang } = useI18n();
  const setPhase = useGameStore((s) => s.setPhase);
  const setBeginnerMode = useGameStore((s) => s.setBeginnerMode);
  const beginnerMode = useGameStore((s) => s.beginnerMode);
  const backDoAdvantage = useGameStore((s) => s.backDoAdvantage);
  const setBackDoAdvantage = useGameStore((s) => s.setBackDoAdvantage);
  const [showSettings, setShowSettings] = useState(false);
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern - Korean clouds */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-9xl">☁</div>
        <div className="absolute bottom-10 right-10 text-9xl">☁</div>
        <div className="absolute top-1/2 left-1/4 text-7xl">☁</div>
        <div className="absolute top-1/3 right-1/4 text-7xl">☁</div>
      </div>

      {/* Top bar with language selector - sticky and clearly separated */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur border-b border-amber-200 px-3 py-2 flex items-center justify-between shadow-sm">
        <div className="text-xs sm:text-sm font-semibold text-stone-600 flex items-center gap-1">
          <span>🎯</span>
          <span className="hidden sm:inline">Yut Nori</span>
        </div>
        <div className="flex gap-1 sm:gap-2 items-center bg-amber-50/80 rounded-full p-1 border border-amber-200">
          <span className="text-[10px] sm:text-xs text-stone-500 px-1 hidden sm:inline">🌐</span>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                soundManager.play('click');
                setLang(l.code);
              }}
              className={`px-2 py-1 text-base sm:text-sm rounded-full transition-all min-w-[32px] ${
                lang === l.code
                  ? 'bg-amber-500 text-white font-bold shadow scale-110'
                  : 'bg-white/70 text-stone-600 hover:bg-white'
              }`}
              title={l.label}
              aria-label={l.label}
            >
              {l.flag}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto mt-12 sm:mt-8">
        {/* Logo / Title */}
        <div className="mb-6 inline-block">
          <div className="relative">
            {/* Decorative border */}
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 rounded-3xl opacity-20 blur-xl" />
            <div className="relative bg-white/90 backdrop-blur rounded-3xl px-8 py-6 shadow-2xl border-2 border-amber-300">
              {/* Traditional Korean pattern */}
              <div className="text-6xl sm:text-7xl mb-2">🎯</div>
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                {t('appTitle')}
              </h1>
              <p className="text-sm sm:text-base text-stone-600 mt-2">{t('appSubtitle')}</p>
              <div className="mt-3 text-xs text-stone-400">韩国传统 보드게임 · Korean Traditional Game</div>
            </div>
          </div>
        </div>

        {/* Menu buttons */}
        <div className="space-y-3 max-w-sm mx-auto">
          <button
            onClick={() => {
              soundManager.play('click');
              setPhase('setup');
            }}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🎮</span> {t('startGame')}
          </button>

          <button
            onClick={() => {
              soundManager.play('click');
              setPhase('tutorial');
            }}
            className="w-full py-4 px-6 rounded-xl bg-white/90 text-stone-700 font-bold text-lg shadow-lg border-2 border-stone-200 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span className="text-2xl">📖</span> {t('howToPlay')}
          </button>

          <button
            onClick={() => {
              soundManager.play('click');
              setShowSettings(true);
            }}
            className="w-full py-4 px-6 rounded-xl bg-white/90 text-stone-700 font-bold text-lg shadow-lg border-2 border-stone-200 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span className="text-2xl">⚙️</span> {t('settings')}
          </button>
        </div>

        {/* Beginner mode quick toggle */}
        <button
          onClick={() => {
            soundManager.play('click');
            setBeginnerMode(!beginnerMode);
          }}
          className={`mt-6 px-4 py-2 rounded-full text-sm font-semibold transition ${
            beginnerMode
              ? 'bg-green-500 text-white shadow'
              : 'bg-white/70 text-stone-600 hover:bg-white'
          }`}
        >
          🎓 {t('beginnerMode')}: {beginnerMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowSettings(false)}
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
                setShowSettings(false);
              }}
              className="w-full py-3 rounded-xl bg-stone-800 text-white font-bold hover:bg-stone-900"
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
