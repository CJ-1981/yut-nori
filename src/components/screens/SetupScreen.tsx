'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game/store';
import { AVATARS, AvatarId } from '@/lib/game/types';
import { useI18n } from '@/lib/i18n/I18nContext';
import { soundManager } from '@/lib/sound/sounds';

const PLAYER_DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const PLAYER_DEFAULT_NAMES_KO = ['플레이어 1', '플레이어 2', '플레이어 3', '플레이어 4'];

export function SetupScreen() {
  const { t, lang } = useI18n();
  const numPlayers = useGameStore((s) => s.numPlayers);
  const setNumPlayers = useGameStore((s) => s.setNumPlayers);
  const players = useGameStore((s) => s.players);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const beginnerMode = useGameStore((s) => s.beginnerMode);
  const setBeginnerMode = useGameStore((s) => s.setBeginnerMode);
  const startGame = useGameStore((s) => s.startGame);
  const setPhase = useGameStore((s) => s.setPhase);

  const [currentStep, setCurrentStep] = useState<'players' | 'avatars'>('players');

  const defaultNames = lang === 'ko' ? PLAYER_DEFAULT_NAMES_KO : PLAYER_DEFAULT_NAMES;
  const usedAvatars = new Set(players.slice(0, numPlayers).map((p) => p.avatarId));

  const handleStart = () => {
    // Fill in default names if empty
    players.slice(0, numPlayers).forEach((p, i) => {
      if (!p.name.trim()) {
        setPlayer(i, { name: defaultNames[i] });
      }
    });
    soundManager.play('click');
    startGame();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              soundManager.play('click');
              if (currentStep === 'avatars') setCurrentStep('players');
              else setPhase('menu');
            }}
            className="px-3 py-2 text-sm font-semibold text-stone-700 bg-white/70 rounded-lg hover:bg-white transition"
          >
            ← {t('back')}
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-800">{t('setupTitle')}</h1>
          <div className="w-16" />
        </div>

        {currentStep === 'players' ? (
          <>
            {/* Step 1: Choose number of players */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border-2 border-amber-200 p-6 shadow-lg mb-4">
              <h2 className="text-lg font-bold text-stone-800 mb-3">{t('selectPlayers')}</h2>
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      soundManager.play('click');
                      setNumPlayers(n);
                    }}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                      numPlayers === n
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-500 shadow-lg scale-105'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl font-bold">{n}</div>
                    <div className="text-xs sm:text-sm">{t('players')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Beginner mode toggle */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border-2 border-amber-200 p-6 shadow-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-stone-800">🎓 {t('beginnerMode')}</h3>
                  <p className="text-sm text-stone-600 mt-1">{t('beginnerModeDesc')}</p>
                </div>
                <button
                  onClick={() => {
                    soundManager.play('click');
                    setBeginnerMode(!beginnerMode);
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    beginnerMode ? 'bg-green-500' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      beginnerMode ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.play('click');
                setCurrentStep('avatars');
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition"
            >
              {t('next')} →
            </button>
          </>
        ) : (
          <>
            {/* Step 2: Avatar & name selection */}
            <div className="space-y-3 mb-4">
              {players.slice(0, numPlayers).map((player, idx) => {
                const avatar = AVATARS.find((a) => a.id === player.avatarId);
                return (
                  <div key={player.id} className="bg-white/80 backdrop-blur rounded-2xl border-2 border-amber-200 p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-sm font-bold text-stone-500">P{idx + 1}</div>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => setPlayer(idx, { name: e.target.value })}
                        placeholder={defaultNames[idx]}
                        maxLength={20}
                        className="flex-1 px-3 py-2 text-sm font-semibold bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    {/* Avatar grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {AVATARS.map((a) => {
                        const isSelected = player.avatarId === a.id;
                        const isUsedByOther = usedAvatars.has(a.id) && !isSelected;
                        return (
                          <button
                            key={a.id}
                            onClick={() => {
                              if (isUsedByOther) return;
                              soundManager.play('click');
                              setPlayer(idx, { avatarId: a.id as AvatarId });
                            }}
                            disabled={isUsedByOther}
                            className={`relative aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                              isSelected
                                ? 'ring-4 ring-amber-400 scale-110 shadow-lg'
                                : isUsedByOther
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:scale-105 hover:shadow-md'
                            }`}
                            style={{
                              background: isSelected
                                ? `linear-gradient(135deg, ${a.gradient[0]}, ${a.gradient[1]})`
                                : 'rgba(255,255,255,0.5)',
                            }}
                            title={t(`avatar${a.id.charAt(0).toUpperCase()}${a.id.slice(1)}` as any)}
                          >
                            {a.emoji}
                            {isSelected && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition"
            >
              🎮 {t('startMatch')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
