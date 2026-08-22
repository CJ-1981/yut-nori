import { Player, YutThrow, TurnPhase } from './types';

export function getToastMessage(
  lastMoveMessage: string | null,
  t: (key: string) => string
): string | null {
  if (!lastMoveMessage) return null;
  if (lastMoveMessage === 'skip') return `⏭️ ${t('next')}`;
  if (lastMoveMessage.startsWith('capture:')) {
    const parts = lastMoveMessage.split(':');
    const count = parts[1] && parts[1].length > 0 ? parts[1] : '1';
    return `⚔️ ${t('hintCaptured')} (×${count})`;
  }
  if (lastMoveMessage.startsWith('carry:')) return `🤝 ${t('hintCarried')}`;
  if (lastMoveMessage === 'finish') return `🏁 ${t('hintFinished')}`;
  return `🚶 ${t('movePiece')}`;
}

export function getAutoSelectablePieceId(
  player: Player | undefined,
  turnPhase: TurnPhase,
  currentYut: YutThrow | null,
  selectedPieceId: string | null
): string | null {
  if (turnPhase !== 'selecting' || !currentYut || selectedPieceId) return null;
  if (!player) return null;

  const homePieces = player.pieces.filter((p) => p.position === -1);
  const boardPieces = player.pieces.filter((p) => p.position >= 0);

  // If back-do and all pieces at home, can't move
  if (currentYut.steps < 0 && boardPieces.length === 0) return null;

  // If no pieces on board, auto-select first home piece
  if (boardPieces.length === 0 && homePieces.length > 0 && currentYut.steps > 0) {
    return homePieces[0].id;
  }

  // If only one piece on board, auto-select it (only one choice)
  if (boardPieces.length === 1) {
    return boardPieces[0].id;
  }

  return null;
}

export function getHintMessage(
  turnPhase: TurnPhase,
  noMovesAvailable: boolean,
  selectedPieceId: string | null,
  possibleMovesCount: number,
  t: (key: string) => string
): string {
  if (turnPhase === 'throwing') return t('hintThrow');
  if (noMovesAvailable) return t('hintBackDo');
  if (turnPhase === 'selecting' && !selectedPieceId) return t('hintSelectPiece');
  if (selectedPieceId && possibleMovesCount === 0) return t('hintSelectPiece');
  if (selectedPieceId) return t('hintChoosePath');
  return '';
}

export function getFinishedCount(player: Player): number {
  return player.pieces.filter((p) => p.position === -2).length;
}

export function getSortedPlayers(players: Player[]): Player[] {
  return players.slice().sort((a, b) => {
    const aFinished = getFinishedCount(a);
    const bFinished = getFinishedCount(b);
    return bFinished - aFinished;
  });
}

export function getFormattedGameTime(
  totalElapsedMs: number,
  gameStartTime: number | null,
  nowMs: number = Date.now()
): { minutes: number; seconds: number; formatted: string } {
  const finalTime = totalElapsedMs || (gameStartTime ? nowMs - gameStartTime : 0);
  const minutes = Math.floor(finalTime / 60000);
  const seconds = Math.floor((finalTime % 60000) / 1000);
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  return { minutes, seconds, formatted };
}
