import * as admin from 'firebase-admin';

export const colors = [
  'red',
  'blue',
  'green',
  'orange',
  'purple',
  'yellow'
];

export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface Game {
  board: { owner: number, tower: boolean }[];
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
  positions: number[];
}

export function isValidMove(move: any, game: Game): move is Move {
  if (game.winner !== -1) {
    return false;
  }
  if (!Array.isArray(move.positions)) {
    return false;
  }
  if (move.positions.length !== 2) { // TODO
    return false;
  }
  for (const position of move.positions) {
    if (game.board[position].owner !== -1 || game.board[position].tower) {
      return false;
    }
  }
  return true;
}
