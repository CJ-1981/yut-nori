// Yut Nori game types

export type AvatarId =
  | 'tiger'
  | 'dragon'
  | 'phoenix'
  | 'turtle'
  | 'crane'
  | 'deer'
  | 'bear'
  | 'rabbit';

export interface Avatar {
  id: AvatarId;
  emoji: string;
  color: string;
  gradient: [string, string];
  korean: string;
}

export const AVATARS: Avatar[] = [
  { id: 'tiger', emoji: '🐯', color: '#E85D04', gradient: ['#F48C06', '#DC2F02'], korean: '호랑이' },
  { id: 'dragon', emoji: '🐉', color: '#1B6CA8', gradient: ['#3FA7D6', '#0D4C7A'], korean: '용' },
  { id: 'phoenix', emoji: '🦚', color: '#C9184A', gradient: ['#FF4D6D', '#800F2F'], korean: '봉황' },
  { id: 'turtle', emoji: '🐢', color: '#386641', gradient: ['#6A994E', '#283618'], korean: '거북이' },
  { id: 'crane', emoji: '🦢', color: '#6C757D', gradient: ['#ADB5BD', '#495057'], korean: '학' },
  { id: 'deer', emoji: '🦌', color: '#BC6C25', gradient: ['#DDA15E', '#7F5539'], korean: '사슴' },
  { id: 'bear', emoji: '🐻', color: '#774936', gradient: ['#A47148', '#4A2C1A'], korean: '곰' },
  { id: 'rabbit', emoji: '🐰', color: '#D62828', gradient: ['#F77F00', '#9D0208'], korean: '토끼' },
];

export type YutResult = 'do' | 'gae' | 'geol' | 'yut' | 'mo' | 'back-do';

export interface YutThrow {
  result: YutResult;
  sticks: boolean[]; // true = round side up (front), false = flat side up (back)
  steps: number; // -1 for back-do, 1-5 for others
  extraTurn: boolean;
  backDoIndex?: number; // index of the red-bottomed stick (for back-do)
}

export type PieceState = 'home' | 'board' | 'finished';

export interface Piece {
  id: string;
  playerId: number;
  position: number; // -1 = home, -2 = finished, 0..20 = board position
  pathType?: 'outer' | 'd0' | 'd4' | 'd8' | 'd12'; // current path type
  carrying: string[]; // IDs of pieces being carried
}

export interface Player {
  id: number;
  name: string;
  avatarId: AvatarId;
  isAI: boolean;
  pieces: Piece[];
}

export type GamePhase =
  | 'menu'
  | 'setup'
  | 'tutorial'
  | 'playing'
  | 'gameover';

export type TurnPhase =
  | 'throwing'
  | 'selecting'
  | 'moving'
  | 'animating'
  | 'extra'
  | 'end';

export interface GameStats {
  startTime: number;
  totalElapsedMs: number;
  turnCount: number;
}
