'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game/store';
import { useI18n } from '@/lib/i18n/I18nContext';
import { AVATARS } from '@/lib/game/types';
import { PLAYER_COLORS } from '@/lib/game/store';
import { soundManager } from '@/lib/sound/sounds';
import { YutBoard } from '@/components/yut/YutBoard';
import { YutThrowPanel } from '@/components/yut/YutThrowPanel';
import { PlayerPanel, Timer } from '@/components/yut/PlayerPanel';

export function GameScreen() {
  const { t } = useI18n();
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const turnPhase = useGameStore((s) => s.turnPhase);
  const currentYut = useGameStore((s) => s.currentYut);
  const selectedPieceId = useGameStore((s) => s.selectedPieceId);
  const possibleMoves = useGameStore((s) => s.possibleMoves);
  const movePiece = useGameStore((s) => s.movePiece);
  const computePossibleMoves = useGameStore((s) => s.computePossibleMoves);
  const selectPiece = useGameStore((s) => s.selectPiece);
  const lastMoveMessage = useGameStore((s) => s.lastMoveMessage);
  const setLastMoveMessage = useGameStore((s) => s.setLastMoveMessage);
  const beginnerMode = useGameStore((s) => s.beginnerMode);
  const setPhase = useGameStore((s) => s.setPhase);
  const numPlayers = useGameStore((s) => s.numPlayers);

  const [showMenu, setShowMenu] = useState(false);
  const canMoveAnyPiece = useGameStore((s) => s.canMoveAnyPiece);
  const skipTurn = useGameStore((s) => s.skipTurn);

  // Derive toast content directly from lastMoveMessage (no setState needed)
  const toast = (() => {
    if (!lastMoveMessage) return null;
    if (lastMoveMessage === 'skip') return `⏭️ ${t('next')}`;
    if (lastMoveMessage.startsWith('capture:')) {
      const count = lastMoveMessage.split(':')[1] ?? '1';
      return `⚔️ ${t('hintCaptured')} (×${count})`;
    }
    if (lastMoveMessage.startsWith('carry:')) return `🤝 ${t('hintCarried')}`;
    if (lastMoveMessage === 'finish') return `🏁 ${t('hintFinished')}`;
    return `🚶 ${t('movePiece')}`;
  })();

  const isCaptureToast = lastMoveMessage?.startsWith('capture:');

  // Play sound effects based on move result
  useEffect(() => {
    if (!lastMoveMessage) return;
    if (lastMoveMessage.startsWith('capture:')) {
      soundManager.play('capture');
    } else if (lastMoveMessage.startsWith('carry:')) {
      soundManager.play('carry');
    } else if (lastMoveMessage === 'finish') {
      soundManager.play('finish');
    }
  }, [lastMoveMessage]);

  // Auto-clear the toast after a delay (timer callback setState is fine)
  useEffect(() => {
    if (!lastMoveMessage) return;
    const timer = setTimeout(() => {
      setLastMoveMessage(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [lastMoveMessage, setLastMoveMessage]);

  // Compute moves when piece selected and yut thrown
  useEffect(() => {
    if (selectedPieceId && currentYut && turnPhase === 'selecting') {
      computePossibleMoves();
    }
  }, [selectedPieceId, currentYut, turnPhase, computePossibleMoves]);

  // Auto-select a piece when entering selecting phase:
  // - If no pieces on board (all at home), auto-select first home piece (so user can bring it out)
  // - If only one piece is on board and can move, auto-select it
  useEffect(() => {
    if (turnPhase !== 'selecting' || !currentYut || selectedPieceId) return;
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return;

    const homePieces = currentPlayer.pieces.filter((p) => p.position === -1);
    const boardPieces = currentPlayer.pieces.filter((p) => p.position >= 0);

    // If back-do and all pieces at home, can't move (handled by noMovesAvailable)
    if (currentYut.steps < 0 && boardPieces.length === 0) return;

    // If no pieces on board, auto-select first home piece
    if (boardPieces.length === 0 && homePieces.length > 0 && currentYut.steps > 0) {
      const timer = setTimeout(() => {
        selectPiece(homePieces[0].id);
      }, 300);
      return () => clearTimeout(timer);
    }

    // If only one piece on board, auto-select it (only one choice)
    if (boardPieces.length === 1 && (currentYut.steps > 0 || true)) {
      const timer = setTimeout(() => {
        selectPiece(boardPieces[0].id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [turnPhase, currentYut, selectedPieceId, players, currentPlayerIndex, selectPiece]);

  const handlePositionClick = (pos: number) => {
    // Start position (0) click: select home piece or bring it out
    if (pos === 0 && currentYut && currentYut.steps > 0) {
      const currentPlayer = players[currentPlayerIndex];
      const homePieces = currentPlayer?.pieces.filter((p) => p.position === -1) ?? [];

      if (homePieces.length > 0) {
        // If home piece already selected, bring it out (move)
        if (selectedPieceId) {
          const selectedPiece = currentPlayer?.pieces.find((p) => p.id === selectedPieceId);
          if (selectedPiece && selectedPiece.position === -1) {
            const moveFromStart = possibleMoves.find((m) => true);
            if (moveFromStart) {
              soundManager.play('move');
              movePiece(selectedPieceId, moveFromStart.position, moveFromStart.pathType, moveFromStart.isFinish);
              return;
            }
          }
        }
        // Otherwise select first home piece
        soundManager.play('click');
        selectPiece(homePieces[0].id);
        return;
      }
    }

    // Normal move: if a move target is clicked and a piece is selected
    const move = possibleMoves.find((m) => m.position === pos);
    if (move && selectedPieceId) {
      soundManager.play('move');
      movePiece(selectedPieceId, move.position, move.pathType, move.isFinish);
      return;
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentAvatar = currentPlayer ? AVATARS.find((a) => a.id === currentPlayer.avatarId) : null;
  const currentColor = PLAYER_COLORS[currentPlayerIndex];

  // Check if no pieces can move (e.g., back-do when all at home)
  const noMovesAvailable = turnPhase === 'selecting' && currentYut && !canMoveAnyPiece();

  const hint = (() => {
    if (turnPhase === 'throwing') return t('hintThrow');
    if (noMovesAvailable) return t('hintBackDo');
    if (turnPhase === 'selecting' && !selectedPieceId) return t('hintSelectPiece');
    if (selectedPieceId && possibleMoves.length === 0) return t('hintSelectPiece');
    if (selectedPieceId) return t('hintChoosePath');
    return '';
  })();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur border-b border-amber-200 px-3 py-2 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => {
            soundManager.play('click');
            setShowMenu(true);
          }}
          className="px-3 py-1.5 text-sm font-semibold text-stone-700 bg-white rounded-lg border border-stone-200 hover:bg-stone-50"
        >
          ☰ {t('mainMenu')}
        </button>
        <Timer />
        <div className="text-xs text-stone-500 hidden sm:block">
          🎯 {t('appTitle')}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-3 sm:p-4 max-w-7xl w-full mx-auto">
        {/* Left: Player panels */}
        <div className="lg:w-56 flex lg:flex-col gap-3 lg:gap-3 overflow-x-auto lg:overflow-visible">
          {players.map((p, i) => (
            <div key={p.id} className="min-w-[200px] lg:min-w-0 flex-shrink-0">
              <PlayerPanel playerId={i} isActive={i === currentPlayerIndex} />
            </div>
          ))}
        </div>

        {/* Center: Board */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          <div className="w-full max-w-2xl">
            <YutBoard
              onPositionClick={handlePositionClick}
              highlightedPositions={possibleMoves.map((m) => m.position)}
              beginnerMode={beginnerMode}
            />
          </div>

          {/* Hint banner */}
          <div className="mt-3 px-4 py-2 bg-amber-100/90 border border-amber-300 rounded-full text-sm font-semibold text-amber-900 text-center max-w-md">
            {hint}
          </div>

          {/* Skip turn button when no moves available */}
          {noMovesAvailable && (
            <button
              onClick={() => {
                soundManager.play('click');
                skipTurn();
              }}
              className="mt-3 px-6 py-3 rounded-xl bg-stone-700 text-white font-bold shadow-lg hover:bg-stone-800 active:scale-95 transition"
            >
              ⏭️ {t('next')} ({t('turnTime')})
            </button>
          )}
        </div>

        {/* Right: Throw panel */}
        <div className="lg:w-72 flex-shrink-0">
          <YutThrowPanel />
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-8 py-4 font-bold rounded-2xl shadow-2xl animate-[bounce_0.5s_ease-out] text-lg ${
            isCaptureToast
              ? 'bg-red-600 text-white ring-4 ring-red-300'
              : lastMoveMessage === 'finish'
              ? 'bg-green-600 text-white ring-4 ring-green-300'
              : 'bg-stone-900/90 text-white'
          }`}
        >
          {toast}
        </div>
      )}

      {/* Menu modal */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-stone-800 mb-4">{t('mainMenu')}</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  soundManager.play('click');
                  setShowMenu(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600"
              >
                ▶ {t('resume')}
              </button>
              <button
                onClick={() => {
                  soundManager.play('click');
                  setShowMenu(false);
                  useGameStore.getState().startGame();
                }}
                className="w-full py-3 px-4 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
              >
                🔄 {t('restart')}
              </button>
              <button
                onClick={() => {
                  soundManager.play('click');
                  setShowMenu(false);
                  setPhase('menu');
                }}
                className="w-full py-3 px-4 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
              >
                🏠 {t('mainMenu')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function GameOverScreen() {
  const { t } = useI18n();
  const players = useGameStore((s) => s.players);
  const winnerId = useGameStore((s) => s.winnerId);
  const startGame = useGameStore((s) => s.startGame);
  const setPhase = useGameStore((s) => s.setPhase);
  const gameStartTime = useGameStore((s) => s.gameStartTime);
  const totalElapsedMs = useGameStore((s) => s.totalElapsedMs);

  useEffect(() => {
    soundManager.play('win');
  }, []);

  const winner = players.find((p) => p.id === winnerId);
  const winnerAvatar = winner ? AVATARS.find((a) => a.id === winner.avatarId) : null;
  const winnerColor = winnerId !== null ? PLAYER_COLORS[winnerId] : '#000';

  const finalTime = totalElapsedMs || (gameStartTime ? Date.now() - gameStartTime : 0);
  const minutes = Math.floor(finalTime / 60000);
  const seconds = Math.floor((finalTime % 60000) / 1000);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 flex flex-col items-center justify-center p-4">
      {/* Confetti emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl animate-bounce"
            style={{
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          >
            {['🎉', '🎊', '⭐', '🏆', '✨'][i % 5]}
          </div>
        ))}
      </div>

      <div className="relative z-10 bg-white/90 backdrop-blur rounded-3xl border-2 border-amber-300 p-8 shadow-2xl max-w-md w-full text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-black text-stone-800 mb-2">{t('winner')}!</h1>

        {/* Winner avatar */}
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${winnerAvatar?.gradient[0]}, ${winnerAvatar?.gradient[1]})` }}
        >
          {winnerAvatar?.emoji}
        </div>

        <div className="text-2xl font-bold mb-1" style={{ color: winnerColor }}>
          {winner?.name}
        </div>
        <div className="text-sm text-stone-500 mb-6">
          {t('gameTime')}: {minutes}:{seconds.toString().padStart(2, '0')}
        </div>

        {/* Standings */}
        <div className="mb-6 space-y-2">
          {players
            .slice()
            .sort((a, b) => {
              const aFinished = a.pieces.filter((p) => p.position === -2).length;
              const bFinished = b.pieces.filter((p) => p.position === -2).length;
              return bFinished - aFinished;
            })
            .map((p, i) => {
              const finished = p.pieces.filter((piece) => piece.position === -2).length;
              const avatar = AVATARS.find((a) => a.id === p.avatarId);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    p.id === winnerId ? 'bg-amber-100 border-2 border-amber-300' : 'bg-stone-50'
                  }`}
                >
                  <div className="text-lg font-bold text-stone-400 w-6">{i + 1}</div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: PLAYER_COLORS[p.id] }}>
                    {avatar?.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-stone-800">{p.name}</div>
                    <div className="text-xs text-stone-500">{finished}/4 {t('finished')}</div>
                  </div>
                  {p.id === winnerId && <div className="text-2xl">👑</div>}
                </div>
              );
            })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              soundManager.play('click');
              startGame();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition"
          >
            🔄 {t('playAgain')}
          </button>
          <button
            onClick={() => {
              soundManager.play('click');
              setPhase('menu');
            }}
            className="flex-1 py-3 rounded-xl bg-stone-200 text-stone-700 font-bold hover:bg-stone-300 transition"
          >
            🏠 {t('mainMenu')}
          </button>
        </div>
      </div>
    </div>
  );
}
