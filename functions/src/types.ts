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

export function getSideLength(arrayLength: number) {
  return 0.5 + Math.sqrt(12 * arrayLength - 3) / 6;
}

export function getArrayLength(sideLength: number) {
  return 3 * (sideLength - 1) * sideLength + 1;
}

export type Direction = 'UR' | 'UL' | 'R' | 'L' | 'DR' | 'DL';


export function getNeighboringHex(current: number, direction: Direction, arrayLength: number) {
  switch (direction) {
    case 'R':
      return current + 1;
    case 'L':
      return current - 1;
    case 'UR':
    case 'UL':
    case 'DR':
    case 'DL':
      return current;
  }
}
