'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game/store';
import { useI18n } from '@/lib/i18n/I18nContext';
import { soundManager } from '@/lib/sound/sounds';
import { TranslationKey } from '@/lib/i18n/translations';

interface TutorialStep {
  emoji: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  illustration?: 'board' | 'yut' | 'movement' | 'capture' | 'carry' | 'shortcut' | 'win';
}

const STEPS: TutorialStep[] = [
  {
    emoji: '👋',
    titleKey: 'tutorialTitle',
    descKey: 'tutorialIntro',
    illustration: 'board',
  },
  {
    emoji: '🎯',
    titleKey: 'tutorialBoard',
    descKey: 'tutorialBoardDesc',
    illustration: 'board',
  },
  {
    emoji: '🎲',
    titleKey: 'tutorialYut',
    descKey: 'tutorialYutDesc',
    illustration: 'yut',
  },
  {
    emoji: '🚶',
    titleKey: 'tutorialMovement',
    descKey: 'tutorialMovementDesc',
    illustration: 'movement',
  },
  {
    emoji: '⚔️',
    titleKey: 'tutorialCapture',
    descKey: 'tutorialCaptureDesc',
    illustration: 'capture',
  },
  {
    emoji: '🤝',
    titleKey: 'tutorialCarry',
    descKey: 'tutorialCarryDesc',
    illustration: 'carry',
  },
  {
    emoji: '⚡',
    titleKey: 'tutorialShortcut',
    descKey: 'tutorialShortcutDesc',
    illustration: 'shortcut',
  },
  {
    emoji: '🏆',
    titleKey: 'tutorialWin',
    descKey: 'tutorialWinDesc',
    illustration: 'win',
  },
];

function BoardIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
      <rect x="20" y="20" width="160" height="160" fill="#F5E6C8" stroke="#5C3A1A" strokeWidth="2" rx="10" />
      <path d="M40 40 L160 160 M160 40 L40 160" stroke="#5C3A1A" strokeWidth="1.5" />
      <path d="M40 40 L160 40 L160 160 L40 160 Z" fill="none" stroke="#5C3A1A" strokeWidth="1.5" />
      {[40, 100, 160].map((x) =>
        [40, 100, 160].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#5C3A1A" />
        ))
      )}
      <circle cx="100" cy="100" r="8" fill="#C9184A" />
    </svg>
  );
}

function YutIllustration() {
  return (
    <div className="flex gap-2 justify-center items-center py-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-3 h-16 rounded-full"
          style={{
            background: `linear-gradient(to right, #8B5A2B, #5C3A1A)`,
            transform: `rotate(${i * 30 - 45}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function MovementIllustration() {
  return (
    <svg viewBox="0 0 200 100" className="w-48 h-24 mx-auto">
      <path d="M20 50 L180 50" stroke="#5C3A1A" strokeWidth="2" markerEnd="url(#arrow)" />
      {[20, 60, 100, 140, 180].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={50} r="6" fill="#5C3A1A" />
          {i < 4 && (
            <text x={x + 30} y={35} fontSize="10" fill="#10B981">→</text>
          )}
        </g>
      ))}
      <circle cx={20} cy={50} r="10" fill="#E85D04" stroke="#000" strokeWidth="1.5" />
      <text x={15} y={55} fontSize="12">🐯</text>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#5C3A1A" />
        </marker>
      </defs>
    </svg>
  );
}

function CaptureIllustration() {
  return (
    <svg viewBox="0 0 200 100" className="w-48 h-24 mx-auto">
      <circle cx="60" cy="50" r="10" fill="#E85D04" stroke="#000" strokeWidth="1.5" />
      <text x={55} y={55} fontSize="12">🐯</text>
      <path d="M75 50 L100 50" stroke="#EF4444" strokeWidth="3" markerEnd="url(#arrowR)" />
      <circle cx="120" cy="50" r="10" fill="#1B6CA8" stroke="#000" strokeWidth="1.5" />
      <text x={115} y={55} fontSize="12">🐉</text>
      <text x={110} y={25} fontSize="14" fill="#EF4444" fontWeight="bold">⚔️</text>
      <defs>
        <marker id="arrowR" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#EF4444" />
        </marker>
      </defs>
    </svg>
  );
}

function CarryIllustration() {
  return (
    <svg viewBox="0 0 200 100" className="w-48 h-24 mx-auto">
      <circle cx="100" cy="50" r="14" fill="#E85D04" stroke="#000" strokeWidth="1.5" />
      <circle cx="100" cy="50" r="10" fill="#E85D04" stroke="#000" strokeWidth="1.5" />
      <text x={95} y={55} fontSize="12">🐯</text>
      <text x={92} y={42} fontSize="9">x2</text>
      <path d="M115 50 L160 50" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowG)" />
      <defs>
        <marker id="arrowG" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#10B981" />
        </marker>
      </defs>
    </svg>
  );
}

function ShortcutIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto">
      <path d="M40 160 L160 40" stroke="#5C3A1A" strokeWidth="2" />
      <path d="M40 160 Q100 100 160 160" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="40" cy="160" r="6" fill="#5C3A1A" />
      <circle cx="160" cy="40" r="6" fill="#5C3A1A" />
      <circle cx="100" cy="100" r="8" fill="#C9184A" />
      <text x={20} y={180} fontSize="10" fill="#10B981">⚡ Short</text>
      <text x={130} y={180} fontSize="10" fill="#9CA3AF">Long</text>
    </svg>
  );
}

function WinIllustration() {
  return (
    <div className="text-center py-4">
      <div className="text-6xl mb-2">🏆</div>
      <div className="flex justify-center gap-1">
        {['🐯', '🐯', '🐯', '🐯'].map((e, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm">
            {e}
          </div>
        ))}
      </div>
    </div>
  );
}

const ILLUSTRATION_MAP: Record<NonNullable<TutorialStep['illustration']>, React.ComponentType> = {
  board: BoardIllustration,
  yut: YutIllustration,
  movement: MovementIllustration,
  capture: CaptureIllustration,
  carry: CarryIllustration,
  shortcut: ShortcutIllustration,
  win: WinIllustration,
};

function Illustration({ type }: { type: TutorialStep['illustration'] }) {
  if (!type) return null;
  const Component = ILLUSTRATION_MAP[type];
  return Component ? <Component /> : null;
}

export function TutorialScreen() {
  const { t } = useI18n();
  const setPhase = useGameStore((s) => s.setPhase);
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-2xl flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              soundManager.play('click');
              if (step > 0) setStep(step - 1);
              else setPhase('menu');
            }}
            className="px-3 py-2 text-sm font-semibold text-stone-700 bg-white/70 rounded-lg hover:bg-white"
          >
            ← {t('back')}
          </button>
          <div className="text-sm font-semibold text-stone-600">
            {t('tutorialStep')} {step + 1} / {STEPS.length}
          </div>
          <button
            onClick={() => {
              soundManager.play('click');
              setPhase('menu');
            }}
            className="px-3 py-2 text-sm font-semibold text-stone-500 hover:text-stone-700"
          >
            {t('skip')}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content card */}
        <div className="flex-1 bg-white/90 backdrop-blur rounded-3xl border-2 border-amber-200 p-6 sm:p-8 shadow-xl flex flex-col">
          <div className="text-5xl sm:text-6xl text-center mb-3">{current.emoji}</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 text-center mb-4">
            {t(current.titleKey)}
          </h2>

          <div className="mb-4">
            <Illustration type={current.illustration} />
          </div>

          <p className="text-base sm:text-lg text-stone-700 text-center leading-relaxed flex-1">
            {t(current.descKey)}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={() => {
                soundManager.play('click');
                setStep(step - 1);
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-white border-2 border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
            >
              ← {t('previous')}
            </button>
          )}
          <button
            onClick={() => {
              soundManager.play('click');
              if (isLast) {
                setPhase('menu');
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition"
          >
            {isLast ? `✓ ${t('gotIt')}` : `${t('next')} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
