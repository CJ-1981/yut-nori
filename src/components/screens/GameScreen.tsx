'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game/store';
import { useI18n } from '@/lib/i18n/I18nContext';
import { AVATARS, Player } from '@/lib/game/types';
import { PLAYER_COLORS } from '@/lib/game/store';
import { soundManager } from '@/lib/sound/sounds';
import { YutBoard } from '@/components/yut/YutBoard';
import { YutThrowPanel } from '@/components/yut/YutThrowPanel';
import { PlayerPanel, Timer } from '@/components/yut/PlayerPanel';
import {
  getToastMessage,
  getAutoSelectablePieceId,
  getHintMessage,
  getFinishedCount,
  getSortedPlayers,
  getFormattedGameTime,
} from '@/lib/game/gameScreenHelpers';

interface GameMenuModalProps {
  onClose: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  t: (key: string) => string;
}

function GameMenuModal({ onClose, onRestart, onMainMenu, t }: GameMenuModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
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
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600"
          >
            ▶ {t('resume')}
          </button>
          <button
            onClick={() => {
              soundManager.play('click');
              onClose();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
          >
            🔄 {t('restart')}
          </button>
          <button
            onClick={() => {
              soundManager.play('click');
              onClose();
              onMainMenu();
            }}
            className="w-full py-3 px-4 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200"
          >
            🏠 {t('mainMenu')}
          </button>
        </div>
      </div>
    </div>
  );
}

interface GameToastProps {
  toast: string;
  isCaptureToast: boolean;
  isFinishToast: boolean;
}

function GameToast({ toast, isCaptureToast, isFinishToast }: GameToastProps) {
  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-8 py-4 font-bold rounded-2xl shadow-2xl animate-[bounce_0.5s_ease-out] text-lg ${
        isCaptureToast
          ? 'bg-red-600 text-white ring-4 ring-red-300'
          : isFinishToast
          ? 'bg-green-600 text-white ring-4 ring-green-300'
          : 'bg-stone-900/90 text-white'
      }`}
    >
      {toast}
    </div>
  );
}

interface PlayerStandingRowProps {
  player: Player;
  rank: number;
  isWinner: boolean;
  t: (key: string) => string;
}

function PlayerStandingRow({ player, rank, isWinner, t }: PlayerStandingRowProps) {
  const finished = getFinishedCount(player);
  const avatar = AVATARS.find((a) => a.id === player.avatarId);
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isWinner ? 'bg-amber-100 border-2 border-amber-300' : 'bg-stone-50'
      }`}
    >
      <div className="text-lg font-bold text-stone-400 w-6">{rank}</div>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{ background: PLAYER_COLORS[player.id] }}
      >
        {avatar?.emoji}
      </div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-stone-800">{player.name}</div>
        <div className="text-xs text-stone-500">
          {finished}/4 {t('finished')}
        </div>
      </div>
      {isWinner && <div className="text-2xl">👑</div>}
    </div>
  );
}

export function GameScreen() {
  const { t } = useI18n();
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

  const [showMenu, setShowMenu] = useState(false);
  const canMoveAnyPiece = useGameStore((s) => s.canMoveAnyPiece);
  const skipTurn = useGameStore((s) => s.skipTurn);

  // Derive toast content directly from lastMoveMessage
  const toast = getToastMessage(lastMoveMessage, t);
  const isCaptureToast = Boolean(lastMoveMessage?.startsWith('capture:'));
  const isFinishToast = lastMoveMessage === 'finish';

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

  // Auto-clear the toast after a delay
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

  // Auto-select a piece when entering selecting phase
  useEffect(() => {
    const pieceIdToSelect = getAutoSelectablePieceId(
      players[currentPlayerIndex],
      turnPhase,
      currentYut,
      selectedPieceId
    );
    if (!pieceIdToSelect) return;

    const timer = setTimeout(() => {
      selectPiece(pieceIdToSelect);
    }, 300);
    return () => clearTimeout(timer);
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
            const moveFromStart = possibleMoves.find(() => true);
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

  // Check if no pieces can move (e.g., back-do when all at home)
  const noMovesAvailable = turnPhase === 'selecting' && currentYut !== null && !canMoveAnyPiece();
  const hint = getHintMessage(turnPhase, noMovesAvailable, selectedPieceId, possibleMoves.length, t);

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
        <GameToast
          toast={toast}
          isCaptureToast={isCaptureToast}
          isFinishToast={isFinishToast}
        />
      )}

      {/* Menu modal */}
      {showMenu && (
        <GameMenuModal
          onClose={() => setShowMenu(false)}
          onRestart={() => useGameStore.getState().startGame()}
          onMainMenu={() => setPhase('menu')}
          t={t}
        />
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

  const { formatted: gameTimeFormatted } = getFormattedGameTime(totalElapsedMs, gameStartTime);
  const sortedPlayers = getSortedPlayers(players);

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
          {t('gameTime')}: {gameTimeFormatted}
        </div>

        {/* Standings */}
        <div className="mb-6 space-y-2">
          {sortedPlayers.map((p, i) => (
            <PlayerStandingRow
              key={p.id}
              player={p}
              rank={i + 1}
              isWinner={p.id === winnerId}
              t={t}
            />
          ))}
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
