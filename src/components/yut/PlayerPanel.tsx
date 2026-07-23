'use client';

import { useEffect, useState } from 'react';
import { useGameStore, PLAYER_COLORS } from '@/lib/game/store';
import { AVATARS, Piece } from '@/lib/game/types';
import { useI18n } from '@/lib/i18n/I18nContext';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function Timer() {
  const gameStartTime = useGameStore((s) => s.gameStartTime);
  const turnStartTime = useGameStore((s) => s.turnStartTime);
  const phase = useGameStore((s) => s.phase);
  const { t } = useI18n();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [phase]);

  if (phase !== 'playing' || !gameStartTime) return null;

  const gameTime = now - gameStartTime;
  const turnTime = now - turnStartTime;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/90 border border-amber-200 rounded-lg shadow-sm">
        <span className="text-amber-700">⏱</span>
        <span className="text-xs font-semibold text-amber-900">{t('gameTime')}</span>
        <span className="text-sm font-mono font-bold text-amber-950 tabular-nums">{formatTime(gameTime)}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-orange-50/90 border border-orange-200 rounded-lg shadow-sm">
        <span className="text-orange-700">🎯</span>
        <span className="text-xs font-semibold text-orange-900">{t('turnTime')}</span>
        <span className="text-sm font-mono font-bold text-orange-950 tabular-nums">{formatTime(turnTime)}</span>
      </div>
    </div>
  );
}

export function PlayerPanel({ playerId, isActive }: { playerId: number; isActive: boolean }) {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const selectedPieceId = useGameStore((s) => s.selectedPieceId);
  const selectPiece = useGameStore((s) => s.selectPiece);
  const { t } = useI18n();

  const player = players.find((p) => p.id === playerId);
  if (!player) return null;

  const avatar = AVATARS.find((a) => a.id === player.avatarId);
  const color = PLAYER_COLORS[playerId];
  const homeCount = player.pieces.filter((p) => p.position === -1).length;
  const boardCount = player.pieces.filter((p) => p.position >= 0).length;
  const finishedCount = player.pieces.filter((p) => p.position === -2).length;

  return (
    <div
      className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400 shadow-lg scale-105'
          : 'bg-white/80 border-stone-200 opacity-70'
      }`}
      style={isActive ? { boxShadow: `0 0 20px ${color}40` } : {}}
    >
      {isActive && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold text-white rounded-full whitespace-nowrap"
          style={{ backgroundColor: color }}
        >
          {t('currentTurn')}
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${avatar?.gradient[0]}, ${avatar?.gradient[1]})` }}
        >
          {avatar?.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-stone-900 truncate" style={{ color }}>
            {player.name}
          </div>
          <div className="text-[10px] text-stone-500">{t(`avatar${avatar?.id.charAt(0).toUpperCase()}${avatar?.id.slice(1)}` as any)}</div>
        </div>
      </div>

      {/* Piece status */}
      <div className="grid grid-cols-3 gap-1 text-center">
        <div className="bg-stone-100 rounded p-1">
          <div className="text-[9px] text-stone-500">{t('home')}</div>
          <div className="text-sm font-bold text-stone-700">{homeCount}</div>
        </div>
        <div className="bg-stone-100 rounded p-1">
          <div className="text-[9px] text-stone-500">{t('onBoard')}</div>
          <div className="text-sm font-bold text-stone-700">{boardCount}</div>
        </div>
        <div className="bg-green-100 rounded p-1">
          <div className="text-[9px] text-stone-500">{t('finished')}</div>
          <div className="text-sm font-bold text-green-700">{finishedCount}</div>
        </div>
      </div>

      {/* Pieces visualization */}
      <div className="mt-2 flex flex-wrap gap-1 justify-center">
        {player.pieces.map((piece) => {
          const isSelected = selectedPieceId === piece.id && isActive;
          const canSelect = isActive && piece.position !== -2;
          return (
            <button
              key={piece.id}
              onClick={() => {
                if (canSelect) {
                  selectPiece(isSelected ? null : piece.id);
                }
              }}
              disabled={!canSelect}
              className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center transition-all ${
                isSelected ? 'ring-2 ring-yellow-400 scale-110' : ''
              } ${piece.position === -2 ? 'opacity-30' : ''} ${canSelect ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
              style={{
                background: piece.position === -2 ? '#9CA3AF' : color,
                border: '1.5px solid rgba(0,0,0,0.4)',
              }}
            >
              {piece.position === -2 ? '✓' : piece.position === -1 ? '🏠' : avatar?.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
