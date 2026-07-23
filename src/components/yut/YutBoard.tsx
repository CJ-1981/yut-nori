'use client';

import { BOARD_POSITIONS, isCorner, isCenter, getPositionCoord, CORNER_POSITIONS } from '@/lib/game/board';
import { useGameStore } from '@/lib/game/store';
import { PLAYER_COLORS } from '@/lib/game/store';
import { AVATARS } from '@/lib/game/types';
import { useI18n } from '@/lib/i18n/I18nContext';

// Convert board coordinates (0-4) to SVG coordinates
// Board is rendered as an SVG with padding
const BOARD_SIZE = 500;
const PADDING = 40;
const GRID_SIZE = (BOARD_SIZE - PADDING * 2) / 4;

function coordToSVG(x: number, y: number): { cx: number; cy: number } {
  // Flip y so 0 is bottom
  return {
    cx: PADDING + x * GRID_SIZE,
    cy: BOARD_SIZE - PADDING - y * GRID_SIZE,
  };
}

interface YutBoardProps {
  onPositionClick: (pos: number) => void;
  highlightedPositions: number[];
  beginnerMode: boolean;
}

export function YutBoard({ onPositionClick, highlightedPositions, beginnerMode }: YutBoardProps) {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const selectedPieceId = useGameStore((s) => s.selectedPieceId);
  const selectPiece = useGameStore((s) => s.selectPiece);
  const possibleMoves = useGameStore((s) => s.possibleMoves);
  const { t } = useI18n();

  // Build lines connecting positions
  const outerLinePoints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((pos) => {
    const c = getPositionCoord(pos);
    return coordToSVG(c.x, c.y);
  });

  // Diagonal lines (corner to corner through center)
  const diagonal1 = [
    getPositionCoord(0), // bottom-right (4,0)
    getPositionCoord(16), // (3,1)
    getPositionCoord(20), // center
    getPositionCoord(17), // (1,3)
    getPositionCoord(8),  // top-left (0,4)
  ].map((c) => coordToSVG(c.x, c.y));

  const diagonal2 = [
    getPositionCoord(4), // bottom-left (0,0)
    getPositionCoord(18), // (1,1)
    getPositionCoord(20), // center
    getPositionCoord(19), // (3,3)
    getPositionCoord(12), // top-right (4,4)
  ].map((c) => coordToSVG(c.x, c.y));

  const outerPath = outerLinePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ') + ' Z';

  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto">
      <svg
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}
      >
        {/* Background - Korean traditional paper color */}
        <defs>
          <radialGradient id="boardBg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#F5E6C8" />
            <stop offset="60%" stopColor="#E8D5A8" />
            <stop offset="100%" stopColor="#D4B98C" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE4A8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFE4A8" stopOpacity="0" />
          </radialGradient>
          <pattern id="hanjiPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="transparent" />
            <circle cx="20" cy="20" r="0.5" fill="#8B6F47" opacity="0.15" />
          </pattern>
          <filter id="positionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={BOARD_SIZE} height={BOARD_SIZE} fill="url(#boardBg)" rx="20" />
        <rect width={BOARD_SIZE} height={BOARD_SIZE} fill="url(#hanjiPattern)" rx="20" />

        {/* Outer border decoration */}
        <rect
          x={8} y={8} width={BOARD_SIZE - 16} height={BOARD_SIZE - 16}
          fill="none"
          stroke="#5C3A1A"
          strokeWidth={2}
          rx={16}
          opacity={0.6}
        />
        <rect
          x={16} y={16} width={BOARD_SIZE - 32} height={BOARD_SIZE - 32}
          fill="none"
          stroke="#8B5A2B"
          strokeWidth={1}
          rx={12}
          opacity={0.4}
        />

        {/* Korean traditional pattern - cloud motifs at corners */}
        {CORNER_POSITIONS.map((pos) => {
          const c = getPositionCoord(pos);
          const svg = coordToSVG(c.x, c.y);
          return (
            <g key={`corner-${pos}`} transform={`translate(${svg.cx}, ${svg.cy})`}>
              <circle r={22} fill="#FFE4A8" opacity={0.4} />
              <text
                textAnchor="middle"
                dy="6"
                fontSize={18}
                fill="#5C3A1A"
                fontWeight="bold"
                style={{ fontFamily: 'serif' }}
              >
                {pos === 0 ? '出' : pos === 4 ? '樂' : pos === 8 ? '福' : '寿'}
              </text>
            </g>
          );
        })}

        {/* Center glow */}
        {(() => {
          const c = getPositionCoord(20);
          const svg = coordToSVG(c.x, c.y);
          return <circle cx={svg.cx} cy={svg.cy} r={50} fill="url(#centerGlow)" />;
        })()}

        {/* Board lines - outer square */}
        <path d={outerPath} fill="none" stroke="#5C3A1A" strokeWidth={2.5} strokeLinejoin="round" />

        {/* Diagonal lines */}
        <polyline
          points={diagonal1.map((p) => `${p.cx},${p.cy}`).join(' ')}
          fill="none"
          stroke="#5C3A1A"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <polyline
          points={diagonal2.map((p) => `${p.cx},${p.cy}`).join(' ')}
          fill="none"
          stroke="#5C3A1A"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Position dots */}
        {BOARD_POSITIONS.map((_, pos) => {
          const c = getPositionCoord(pos);
          const svg = coordToSVG(c.x, c.y);
          const isHighlighted = highlightedPositions.some((h) => {
            // Check if this position is in highlighted moves
            const move = possibleMoves.find((m) => m.position === pos);
            return move !== undefined && highlightedPositions.includes(pos);
          });
          const isPossible = possibleMoves.some((m) => m.position === pos);
          const corner = isCorner(pos);
          const center = isCenter(pos);

          return (
            <g key={`pos-${pos}`} transform={`translate(${svg.cx}, ${svg.cy})`}>
              {/* Large invisible touch target for highlighted positions */}
              {isPossible && (
                <circle
                  r={38}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPositionClick(pos)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onPositionClick(pos);
                  }}
                />
              )}
              {/* Highlight ring (rendered for visual, no pointer events) */}
              {isPossible && (
                <>
                  <circle
                    r={34}
                    fill="#10B981"
                    opacity={0.2}
                    style={{ pointerEvents: 'none' }}
                  />
                  <circle
                    r={28}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={4}
                    opacity={0.95}
                    className="animate-pulse"
                    style={{ pointerEvents: 'none' }}
                  />
                </>
              )}

              {/* Position dot - visual only, much larger now */}
              <circle
                r={center ? 20 : corner ? 18 : isPossible ? 18 : 11}
                fill={center ? '#C9184A' : corner ? '#5C3A1A' : '#5C3A1A'}
                stroke="#3D2410"
                strokeWidth={2}
                style={{ pointerEvents: 'none' }}
              />
              {center && (
                <text
                  textAnchor="middle"
                  dy="7"
                  fontSize={18}
                  fill="#FFE4A8"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  中
                </text>
              )}
              {/* Position label for corners */}
              {corner && !isPossible && (
                <text
                  textAnchor="middle"
                  dy="5"
                  fontSize="12"
                  fill="#FFE4A8"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {pos === 0 ? '出' : pos === 4 ? '福' : pos === 8 ? '寿' : '樂'}
                </text>
              )}
            </g>
          );
        })}

        {/* Render pieces - each piece animates independently to its position */}
        {(() => {
          // Build a list of all pieces on the board with their positions
          const allPieces: Array<{
            pieceId: string;
            playerId: number;
            position: number;
            isCarried: boolean;
            stackIndex: number;
            stackSize: number;
          }> = [];

          for (const player of players) {
            for (const piece of player.pieces) {
              if (piece.position >= 0) {
                const isCarried = players
                  .find((p) => p.id === player.id)
                  ?.pieces.some((p) => p.carrying.includes(piece.id)) ?? false;
                // Find stack index at this position for this player
                const piecesAtSamePos = player.pieces.filter(
                  (p) => p.position === piece.position && p.position !== -2
                );
                const stackIndex = piecesAtSamePos.findIndex((p) => p.id === piece.id);
                allPieces.push({
                  pieceId: piece.id,
                  playerId: piece.playerId,
                  position: piece.position,
                  isCarried,
                  stackIndex: stackIndex >= 0 ? stackIndex : 0,
                  stackSize: piecesAtSamePos.length,
                });
              }
            }
          }

          return allPieces.map((p) => {
            const c = getPositionCoord(p.position);
            const svg = coordToSVG(c.x, c.y);
            const player = players.find((pl) => pl.id === p.playerId);
            if (!player) return null;
            const avatar = AVATARS.find((a) => a.id === player.avatarId);
            const color = PLAYER_COLORS[p.playerId];
            // Offset pieces in a stack horizontally (larger spacing for bigger pieces)
            const offset = p.stackSize > 1 ? (p.stackIndex - (p.stackSize - 1) / 2) * 22 : 0;
            const isSelected = selectedPieceId === p.pieceId;
            const finalX = svg.cx + offset;
            // Check if this position is a possible move target
            const isPossibleTarget = possibleMoves.some((m) => m.position === p.position);

            return (
              <g
                key={p.pieceId}
                style={{
                  transform: `translate(${finalX}px, ${svg.cy}px)`,
                  transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  // If this is a possible target, let clicks pass through to position handler
                  // Otherwise, allow piece selection
                  cursor: isPossibleTarget ? 'pointer' : (p.playerId === currentPlayerIndex && !p.isCarried ? 'pointer' : 'default'),
                  pointerEvents: isPossibleTarget ? 'none' : 'auto',
                }}
                onClick={(e) => {
                  // If position is a possible target, don't select piece - let position click handle it
                  if (isPossibleTarget) return;
                  e.stopPropagation();
                  if (p.playerId === currentPlayerIndex && !p.isCarried) {
                    selectPiece(selectedPieceId === p.pieceId ? null : p.pieceId);
                  }
                }}
              >
                {/* Selected highlight */}
                {isSelected && (
                  <circle r={26} fill="none" stroke="#FCD34D" strokeWidth={4} className="animate-pulse" style={{ pointerEvents: 'none' }} />
                )}
                {/* Piece shadow */}
                <ellipse cx={0} cy={5} rx={18} ry={5} fill="rgba(0,0,0,0.35)" style={{ pointerEvents: 'none' }} />
                {/* Piece body - much larger now */}
                <circle
                  r={19}
                  fill={color}
                  stroke="#000"
                  strokeWidth={2.5}
                  opacity={p.isCarried ? 0.7 : 1}
                  style={{ pointerEvents: 'none' }}
                />
                {/* Avatar emoji - larger */}
                <text
                  textAnchor="middle"
                  dy={7}
                  fontSize={22}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {avatar?.emoji ?? '●'}
                </text>
                {/* Stack indicator - show count on first piece of stack */}
                {p.stackSize > 1 && p.stackIndex === 0 && (
                  <text
                    textAnchor="middle"
                    dy={-22}
                    fontSize={14}
                    fill="#5C3A1A"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    ×{p.stackSize}
                  </text>
                )}
              </g>
            );
          });
        })()}

        {/* Beginner hint: shortcut indicator */}
        {beginnerMode && (() => {
          const player = players[currentPlayerIndex];
          const selectedPiece = player?.pieces.find((p) => p.id === selectedPieceId);
          if (selectedPiece && selectedPiece.position >= 0 && CORNER_POSITIONS.includes(selectedPiece.position)) {
            const c = getPositionCoord(selectedPiece.position);
            const svg = coordToSVG(c.x, c.y);
            return (
              <g transform={`translate(${svg.cx}, ${svg.cy - 30})`}>
                <rect x={-50} y={-10} width={100} height={20} fill="#FEF3C7" rx={4} opacity={0.95} />
                <text
                  textAnchor="middle"
                  dy={4}
                  fontSize={10}
                  fill="#92400E"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {t('shortcutAvailable')}
                </text>
              </g>
            );
          }
          return null;
        })()}
      </svg>
    </div>
  );
}
