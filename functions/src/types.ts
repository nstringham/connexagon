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
  board: Cell[];
  players: Player[];
  turn: number;
  winner: number;
  modified: admin.firestore.Timestamp;
  uids: string[];
}

export type Player = {
  color: Color;
  nickname: string;
  points: number;
}

export type Cell = {
  owner: number;
  tower: boolean;
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
  if (move.positions.length > getMaxMove(game)) {
    return false;
  }
  for (const position of move.positions) {
    if (game.board[position].owner !== -1 || game.board[position].tower) {
      return false;
    }
  }
  return true;
}

export function getMaxMove(game: Game) {
  return Math.min(5 - Math.max(1, game.players[game.turn % game.players.length].points), game.turn + 1);
}

export function getSideLength(arrayLength: number) {
  return 0.5 + Math.sqrt(12 * arrayLength - 3) / 6;
}

export function getArrayLength(sideLength: number) {
  return 3 * (sideLength - 1) * sideLength + 1;
}

export type Direction = 'UR' | 'UL' | 'NR' | 'NL' | 'DR' | 'DL';

export class GridData {
  rowStartsMap: { [key: number]: number[] } = {};
  getRowStarts(sideLength: number): number[] {
    if (this.rowStartsMap[sideLength] === undefined) {
      let id = 0;
      this.rowStartsMap[sideLength] = new Array(sideLength * 2).fill(null).map((_value, row) => {
        if (row > 0) {
          id += (sideLength * 2 - 1) - Math.abs((row - 1) - (sideLength - 1));
        }
        return id;
      });
    }
    return this.rowStartsMap[sideLength];
  }

  getNeighboringHex(current: number, sideLength: number, direction: Direction) {
    return this.getNeighboringHexes(current, sideLength, [direction])[0];
  }

  getNeighboringHexes(current: number, sideLength: number, directions?: Direction[]) {
    const RowStarts = this.getRowStarts(sideLength);
    let currentRow = 0;
    while (RowStarts[currentRow + 1] <= current) currentRow++;
    return (directions || ['UR', 'UL', 'NR', 'NL', 'DR', 'DL']).map(direction => {
      switch (direction) {
        case 'NR':
          return (RowStarts[currentRow + 1] - 1 === current) ? -1 : current + 1;
        case 'NL':
          return (RowStarts[currentRow] === current) ? -1 : current - 1;
        case 'UR':
        case 'UL':
        case 'DR':
        case 'DL':
          const rowPosition = current - RowStarts[currentRow];
          const left = direction.charAt(1) === 'L';
          switch (direction) {
            case 'UR':
            case 'UL':
              const above = (currentRow - (sideLength - 1) <= 0);
              if (currentRow === 0 || (above && (left ? RowStarts[currentRow] === current : RowStarts[currentRow + 1] - 1 === current))) {
                return -1;
              }
              return RowStarts[currentRow - 1] + (left ? -0.5 : +0.5) + (above ? -0.5 : 0.5) + rowPosition;
            case 'DR':
            case 'DL':
              const below = (currentRow - (sideLength - 1) >= 0);
              if (currentRow === sideLength * 2 - 2 || (below && (left ? RowStarts[currentRow] === current : RowStarts[currentRow + 1] - 1 === current))) {
                return -1;
              }
              return RowStarts[currentRow + 1] + (left ? -0.5 : +0.5) + (below ? -0.5 : 0.5) + rowPosition;
          }
      }
    });
  }
}

export type UserData = {
  color?: Color;
  nickname: string;
}

export const nicknameMaxLength = 10;
export const nicknameMinLength = 2;
