import * as admin from 'firebase-admin';

export const colors: Color[] = [
  'red',
  'blue',
  'green',
  'orange',
  'purple',
  'yellow'
];

export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface Game {
  board: number[];
  players: Player[];
  turn: number;
  winner: number;
  modified: admin.firestore.Timestamp;
  uids: string[];
}

export type Player = {
  color: Color;
  nickname: string;
}

export type Move = {
  position: number;
}

export function isValidMove(move: any, game: Game): move is Move {
  return game.board[move.position] === -1 && game.winner === -1;
}

export type UserData = {
  color?: Color;
  nickname: string;
}

export const nicknameMaxLength = 10;
export const nicknameMinLength = 2;
