import { halfSqrt3, round } from "./hexagon";
import triangleNumbers from "virtual:triangle-numbers";

export enum Color {
  UNCLAIMED = 0,
  RED,
  GOLD,
  GREEN,
  AQUA,
  BLUE,
  PURPLE,
  PINK,
}

export const colors = Object.values(Color).filter((value) => typeof value === "number");

export type Board = { towers: number[]; cells: Uint8Array };

export function decodeHex(hex: string) {
  if (!hex.startsWith("\\x")) {
    throw new SyntaxError('String should start with "\\x"');
  }
  hex = hex.substring(2);
  if (hex.length % 2 !== 0) {
    throw new SyntaxError("String should be an even number of characters");
  }
  if (/[^\da-f]/i.test(hex)) {
    throw new SyntaxError("String should only contain hex characters");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export type Point = [number, number];

export function getSize(area: number): number {
  return 0.5 + Math.sqrt(12 * area - 3) / 6;
}

export function getLayout(size: number): Point[] {
  const layout: Point[] = [];

  const rows = size * 2 - 1;
  const rowOffset = (rows - 1) / 2;

  const horizontalSpacing = 2 * halfSqrt3;
  const verticalSpacing = 1.5;

  for (let row = 0; row < rows; row++) {
    const columns = rows - Math.abs(row - (size - 1));
    const columnOffset = (columns - 1) / 2;

    for (let column = 0; column < columns; column++) {
      layout.push([
        round((column - columnOffset) * horizontalSpacing),
        (row - rowOffset) * verticalSpacing,
      ]);
    }
  }

  return layout;
}

export function getAdjacentCells(length: number, index: number): number[] {
  const centerOfBoard = length / 2;

  // mirror if index is in the bottom half of the board
  if (index > centerOfBoard) {
    const mirror = (cell: number) => length - 1 - cell;
    return getAdjacentCells(length, mirror(index)).map(mirror);
  }

  const size = getSize(length);

  const rowWidth = Math.round(Math.sqrt(2 * (index + triangleNumbers[size - 1] + 1)));

  const beginningOfRow = triangleNumbers[rowWidth - 1] - triangleNumbers[size - 1];

  const endOfRow = beginningOfRow + rowWidth - 1;

  const cells: number[] = [];

  // top neighbors
  if (index >= size) {
    // not first row
    if (index !== beginningOfRow) {
      cells.push(index - rowWidth);
    }
    if (index !== endOfRow) {
      cells.push(index - rowWidth + 1);
    }
  }

  // left and right neighbors
  if (index !== beginningOfRow) {
    cells.push(index - 1);
  }
  if (index !== endOfRow) {
    cells.push(index + 1);
  }

  // bottom neighbors
  if (endOfRow < centerOfBoard) {
    // not middle row
    cells.push(index + rowWidth, index + rowWidth + 1);
  } else {
    // middle row
    if (index !== beginningOfRow) {
      cells.push(index + rowWidth - 1);
    }
    cells.push(index + rowWidth);
  }

  return cells;
}

export function generateBoard(players: number): Board {
  const size = players + 7;

  const length = 3 * size * (size - 1) + 1;

  const cells = new Uint8Array(length);

  const towers: number[] = [];

  const towerDistances = new Uint8Array(length).fill(size * 2);

  function placeTower(index: number) {
    towers.push(index);

    towerDistances[index] = 0;
    const distancesToPropagate = [index];
    while (distancesToPropagate.length > 0) {
      const index = distancesToPropagate.shift()!;
      const distance = towerDistances[index];
      for (const neighbor of getAdjacentCells(length, index)) {
        if (towerDistances[neighbor] > distance + 1) {
          towerDistances[neighbor] = distance + 1;
          distancesToPropagate.push(neighbor);
        }
      }
    }
  }

  function getRandomTowerPlacement(): number {
    while (true) {
      const index = Math.floor(Math.random() * length);

      if (towerDistances[index] <= 1) {
        continue;
      }

      if (getAdjacentCells(length, index).length < 6) {
        continue;
      }

      return index;
    }
  }

  for (let tower = 0; tower < 4 * players + 1; tower++) {
    let furthest: number = getRandomTowerPlacement();
    for (let option = 1; option < 12; option++) {
      const randomIndex = getRandomTowerPlacement();
      if (towerDistances[randomIndex] > towerDistances[furthest]) {
        furthest = randomIndex;
      }
    }

    placeTower(furthest);
  }

  return { towers, cells };
}

/** counts how many towers of each color exist */
export function countTowers({ towers, cells }: Board): number[] {
  const towersByColor = colors.map(() => 0);

  for (const tower of towers) {
    towersByColor[cells[tower]] += 1;
  }

  return towersByColor;
}

/**
 * calculates how many cells a player may select on their turn
 * @param turn the index of the turn the game is currently on
 * @param towers the number of towers the player has already captured
 * @returns the maximum number of cells the player may place this turn
 */
export function getMaxTurnSize(turn: number, towers: number) {
  return Math.min(4, turn + 1, 5 - towers);
}

export class InvalidTurnError extends Error {}

/**
 * Applies a turn and all it's effects to the game board
 * @param board the game board
 * @param turn the indexes of the cells claimed by the player in this turn
 * @param color the color of the player
 * @returns the number of towers claimed by this turn
 * @throws `InvalidTurnError` if the turn is not valid for the board
 */
export function doTurn({ towers, cells }: Board, turn: number[], color: Color): number {
  for (const i of turn) {
    if (towers.includes(i)) {
      throw new InvalidTurnError("you can not directly claim a tower");
    }

    if (cells[i] !== 0) {
      throw new InvalidTurnError("you may not claim a cell that is already claimed");
    }

    cells[i] = color;
  }

  let claimedTowers = 0;

  const checkedCells = new Set<number>();
  for (const turnCell of turn) {
    const cellsToCheck = [turnCell];

    const foundTowers = new Set<number>();

    while (cellsToCheck.length > 0) {
      const cell = cellsToCheck.pop()!;

      if (checkedCells.has(cell)) {
        continue;
      }
      checkedCells.add(cell);

      if (towers.includes(cell) && (cells[cell] === 0 || cells[cell] === color)) {
        foundTowers.add(cell);
        continue;
      }

      if (cells[cell] === color) {
        cellsToCheck.push(...getAdjacentCells(cells.length, cell));
      }
    }

    if (foundTowers.size > 1) {
      for (const tower of foundTowers) {
        if (cells[tower] != color) {
          cells[tower] = color;
          claimedTowers += 1;
        }
      }
    }
  }

  return claimedTowers;
}
