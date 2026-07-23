'use client';

import { I18nProvider } from '@/lib/i18n/I18nContext';
import { useGameStore } from '@/lib/game/store';
import { MainMenu } from '@/components/screens/MainMenu';
import { SetupScreen } from '@/components/screens/SetupScreen';
import { TutorialScreen } from '@/components/screens/TutorialScreen';
import { GameScreen, GameOverScreen } from '@/components/screens/GameScreen';

function GameRouter() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case 'menu':
      return <MainMenu />;
    case 'setup':
      return <SetupScreen />;
    case 'tutorial':
      return <TutorialScreen />;
    case 'playing':
      return <GameScreen />;
    case 'gameover':
      return <GameOverScreen />;
    default:
      return <MainMenu />;
  }
}

export default function Home() {
  return (
    <I18nProvider>
      <main className="min-h-screen w-full">
        <GameRouter />
      </main>
    </I18nProvider>
  );
}
