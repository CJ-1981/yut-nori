'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game/store';
import { YutThrow } from '@/lib/game/types';
import { useI18n } from '@/lib/i18n/I18nContext';
import { soundManager } from '@/lib/sound/sounds';
import { YutThrow3D } from './YutThrow3D';

const YUT_LABELS: Record<string, { color: string; bg: string }> = {
  'do': { color: '#92400E', bg: 'from-yellow-100 to-yellow-200' },
  'gae': { color: '#9A3412', bg: 'from-orange-100 to-orange-200' },
  'geol': { color: '#9D174D', bg: 'from-pink-100 to-pink-200' },
  'yut': { color: '#15803D', bg: 'from-green-100 to-green-200' },
  'mo': { color: '#1E40AF', bg: 'from-blue-100 to-purple-200' },
  'back-do': { color: '#581C87', bg: 'from-purple-100 to-purple-200' },
};

function getYutLabelKey(result: string): string {
  if (result === 'back-do') return 'yutBackDo';
  return `yut${result.charAt(0).toUpperCase()}${result.slice(1)}`;
}

export function YutThrowPanel() {
  const { t } = useI18n();
  const throwYut = useGameStore((s) => s.throwYut);
  const currentYut = useGameStore((s) => s.currentYut);
  const setYutResult = useGameStore((s) => s.setYutResult);
  const turnPhase = useGameStore((s) => s.turnPhase);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const players = useGameStore((s) => s.players);
  const setTurnPhase = useGameStore((s) => s.setTurnPhase);
  const computePossibleMoves = useGameStore((s) => s.computePossibleMoves);
  const beginnerMode = useGameStore((s) => s.beginnerMode);
  const yutHistory = useGameStore((s) => s.yutHistory);
  const extraTurns = useGameStore((s) => s.extraTurns);
  const PLAYER_COLORS_LOCAL = ['#E85D04', '#1B6CA8', '#C9184A', '#386641'];

  const [isAnimating, setIsAnimating] = useState(false);
  const [displayResult, setDisplayResult] = useState<YutThrow | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [userInteracting, setUserInteracting] = useState(false); // user controlling camera

  const player = players[currentPlayerIndex];
  const playerColor = PLAYER_COLORS_LOCAL[currentPlayerIndex];

  const handleThrow = () => {
    if (isAnimating || turnPhase !== 'throwing') return;
    soundManager.play('throw');
    setIsAnimating(true);
    setShowResult(false);
    setShowContinue(false);
    setDisplayResult(null);

    // Generate the result immediately but reveal after physics simulation settles
    const result = throwYut();
    setDisplayResult(result);

    // Play result sound after physics throw + settle + camera rotation
    // Timeline: physics throw+settle(~2.5s) + camera rotate(1.0s) = 3.5s
    setTimeout(() => {
      soundManager.play(result.result.replace('-', '') as any);
      setShowResult(true);
      setTimeout(() => {
        setShowContinue(true);
      }, 600);
    }, 4000);
  };

  const handleAnimationEnd = () => {
    // Animation is done, but we wait for user to continue (or auto-continue)
    // The result is already showing via showResult
  };

  const handleContinue = () => {
    soundManager.play('click');
    setIsAnimating(false);
    setShowContinue(false);
    setTurnPhase('selecting');
    // Compute possible moves will happen when piece is selected
    if (displayResult) {
      // Use setTimeout to ensure state is updated
      setTimeout(() => computePossibleMoves(), 50);
    }
  };

  // Handle actual measured result from physics simulation
  // Recalculate the yut result based on actual stick orientations
  const handleActualResult = (actualSticks: boolean[]) => {
    if (!displayResult) return;

    // Count top faces (light side up = true)
    const topCount = actualSticks.filter((s) => s).length;

    // Check for back-do: 3 top faces + 1 bottom (red) face
    // The backDoIndex from original result indicates which stick has red bottom
    const originalBackDoIndex = displayResult.backDoIndex;
    let isBackDo = false;
    if (topCount === 3 && originalBackDoIndex !== undefined) {
      // The one bottom-up stick should be the red-bottomed one
      const bottomUpIndex = actualSticks.indexOf(false);
      if (bottomUpIndex === originalBackDoIndex) {
        isBackDo = true;
      }
    }

    // Determine result based on actual top count
    let result: YutThrow['result'];
    let steps: number;
    let extraTurn = false;

    if (isBackDo) {
      result = 'back-do';
      steps = -1;
    } else {
      switch (topCount) {
        case 4: result = 'mo'; steps = 5; extraTurn = true; break;
        case 3: result = 'do'; steps = 1; break;
        case 2: result = 'gae'; steps = 2; break;
        case 1: result = 'geol'; steps = 3; break;
        case 0: default: result = 'yut'; steps = 4; extraTurn = true; break;
      }
    }

    // Only update if result changed from original
    if (result !== displayResult.result) {
      const updatedResult: YutThrow = {
        result,
        sticks: actualSticks,
        steps,
        extraTurn,
        backDoIndex: isBackDo ? originalBackDoIndex : undefined,
      };
      setDisplayResult(updatedResult);
      setYutResult(updatedResult);
    }
  };

  // Auto-continue after a delay if user doesn't click
  // But NOT if user is interacting with the camera
  useEffect(() => {
    if (showContinue && !showResult) return;
    if (showContinue && !userInteracting) {
      const timer = setTimeout(() => {
        handleContinue();
      }, 5000); // longer delay to allow camera exploration
      return () => clearTimeout(timer);
    }
  }, [showContinue, userInteracting]);

  // Pointer drag handling for "throw feel"
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating || turnPhase !== 'throwing') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart) return;
    const dy = dragStart.y - e.clientY;
    setDragOffset(Math.max(0, Math.min(120, dy)));
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 40) {
      handleThrow();
    }
    setDragOffset(0);
    setDragStart(null);
  };

  const resultLabel = displayResult ? t(getYutLabelKey(displayResult.result) as any) : '';
  const resultDesc = displayResult ? t(`${getYutLabelKey(displayResult.result)}Desc` as any) : '';
  const resultStyle = displayResult ? YUT_LABELS[displayResult.result] : null;

  // Determine which throw hint to show based on input method
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const throwHint = isTouchDevice ? t('dragToThrow') : t('clickToThrow');

  return (
    <div className="relative flex flex-col gap-3">
      {/* 3D Animation overlay - full screen with clear canvas container */}
      {isAnimating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-100">
          {/* Canvas container with subtle border for clear boundaries */}
          <div
            className="relative w-full h-full max-w-3xl"
            style={{
              background: '#FAFAF7',
            }}
          >
            <YutThrow3D
              isThrown={isAnimating}
              throwResult={displayResult}
              onAnimationEnd={handleAnimationEnd}
              onUserInteraction={setUserInteracting}
              onActualResult={handleActualResult}
            />
            {/* Result overlay - positioned at top to avoid overlapping sticks */}
            {showResult && displayResult && resultStyle && (
              <div className="absolute inset-x-0 top-6 flex flex-col items-center gap-4 pointer-events-none px-4">
                <div
                  className={`px-8 py-4 rounded-2xl bg-gradient-to-br ${resultStyle.bg} border-2 shadow-2xl animate-[bounce_0.5s_ease-out]`}
                  style={{ borderColor: resultStyle.color }}
                >
                  <div className="text-5xl font-bold text-center" style={{ color: resultStyle.color }}>
                    {resultLabel}!
                  </div>
                  <div className="text-sm text-center mt-1" style={{ color: resultStyle.color }}>
                    {resultDesc}
                  </div>
                  {displayResult.extraTurn && (
                    <div className="mt-2 text-center text-xs font-bold text-green-600">
                      + {t('extraTurn')}
                    </div>
                  )}
                </div>
                {/* Camera control hint */}
                <div className="pointer-events-none px-4 py-1.5 bg-stone-800/80 text-white text-xs rounded-full backdrop-blur">
                  👆 Drag to rotate camera · Pinch to zoom
                </div>
                {showContinue && (
                  <button
                    onClick={handleContinue}
                    className="pointer-events-auto px-8 py-3 rounded-xl bg-stone-800 text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition animate-[bounce_0.5s_ease-out]"
                  >
                    {t('confirm')} →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Throw button area */}
      <div className="bg-white/90 backdrop-blur rounded-2xl border-2 border-amber-300 p-4 shadow-lg">
        <div className="text-center mb-3">
          <div className="text-xs text-stone-500 uppercase tracking-wide">{t('currentTurn')}</div>
          <div className="text-lg font-bold" style={{ color: playerColor }}>
            {player?.name}
            {extraTurns > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                +{extraTurns} {t('extraTurn')}
              </span>
            )}
          </div>
        </div>

        {/* Throw button - drag enabled */}
        {turnPhase === 'throwing' && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={() => !isDragging && dragOffset === 0 && handleThrow()}
            className="relative cursor-pointer select-none touch-none"
            style={{ touchAction: 'none' }}
          >
            <div
              className="w-full py-6 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-lg text-center shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              style={{
                transform: `translateY(-${dragOffset * 0.3}px)`,
                boxShadow: dragOffset > 0 ? `0 ${10 + dragOffset / 4}px ${20 + dragOffset / 3}px rgba(0,0,0,0.3)` : '',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🎲</span>
                <span>{t('throwYut')}</span>
              </div>
              <div className="text-[10px] mt-1 opacity-80">{throwHint}</div>
            </div>
            {/* Drag indicator */}
            {dragOffset > 0 && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-600 text-sm font-bold">
                ↑ {dragOffset > 80 ? t('swingToThrow') + '!' : ''}
              </div>
            )}
          </div>
        )}

        {turnPhase !== 'throwing' && (
          <div className="w-full py-6 rounded-xl bg-stone-100 text-stone-500 font-bold text-lg text-center">
            {currentYut ? t('selectPiece') : '...'}
          </div>
        )}

        {/* Current result */}
        {currentYut && !isAnimating && (
          <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-500 uppercase">{t('lastThrow')}</div>
                <div className="font-bold text-lg" style={{ color: resultStyle?.color }}>
                  {t(getYutLabelKey(currentYut.result) as any)}
                </div>
              </div>
              <div className="text-2xl">
                {currentYut.result === 'do' && '⚀'}
                {currentYut.result === 'gae' && '⚁'}
                {currentYut.result === 'geol' && '⚂'}
                {currentYut.result === 'yut' && '⚃'}
                {currentYut.result === 'mo' && '⚄'}
                {currentYut.result === 'back-do' && '↩'}
              </div>
            </div>
            {currentYut.extraTurn && (
              <div className="mt-1 text-xs font-bold text-green-600">+ {t('extraTurn')}</div>
            )}
          </div>
        )}

        {/* Yut history */}
        {yutHistory.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1 justify-center">
            {yutHistory.slice(-8).map((y, i) => (
              <div
                key={i}
                className="px-2 py-1 text-[10px] rounded-md bg-stone-100 text-stone-700 font-mono"
                title={t(getYutLabelKey(y.result) as any)}
              >
                {t(getYutLabelKey(y.result) as any)}
              </div>
            ))}
          </div>
        )}

        {/* Beginner hint */}
        {beginnerMode && turnPhase === 'throwing' && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            💡 {t('hintThrow')}
          </div>
        )}
      </div>
    </div>
  );
}
