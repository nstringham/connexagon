import { describe, it, expect, vi } from "vitest";
import {
  Color,
  countTowers,
  decodeHex,
  doTurn,
  generateBoard,
  getAdjacentCells,
  getLayout,
  getMaxTurnSize,
  getSize,
  InvalidTurnError,
  type Board,
} from "./board";
import { round } from "./hexagon";

/** https://gist.github.com/avilde/3736a903560b35fd587d213a3f79fad7 */
export function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let imul = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    imul = (imul + Math.imul(imul ^ (imul >>> 7), 61 | imul)) ^ imul;
    return ((imul ^ (imul >>> 14)) >>> 0) / 4294967296;
  };
}

/** creates a board from a hardcoded string for use in tests */
function fromEmoji([text]: TemplateStringsArray | [string]): Board {
  const lookup: { [key: string]: { tower: boolean; color: Color } } = {
    "⚫": { tower: false, color: Color.UNCLAIMED },
    "🔴": { tower: false, color: Color.RED },
    "🟡": { tower: false, color: Color.GOLD },
    "🟢": { tower: false, color: Color.GREEN },
    "🔵": { tower: false, color: Color.BLUE },
    "🟣": { tower: false, color: Color.PURPLE },
    "🔲": { tower: true, color: Color.UNCLAIMED },
    "🟥": { tower: true, color: Color.RED },
    "🟨": { tower: true, color: Color.GOLD },
    "🟩": { tower: true, color: Color.GREEN },
    "🟦": { tower: true, color: Color.BLUE },
    "🟪": { tower: true, color: Color.PURPLE },
  };

  const towers: number[] = [];
  const cells: number[] = [];

  const segments = [...new Intl.Segmenter().segment(text.replaceAll(/\s/g, ""))];

  for (const [i, { segment }] of segments.entries()) {
    if (!(segment in lookup)) {
      throw new Error(`invalid board character '${segment}'`);
    }

    const { tower, color } = lookup[segment];

    if (tower) {
      towers.push(i);
    }

    cells.push(color);
  }

  return { towers, cells: new Uint8Array(cells) };
}

describe("decodeHex", () => {
  it("should convert hex into bytes", () => {
    expect(decodeHex("\\xcafed00d")).to.deep.equal(new Uint8Array([202, 254, 208, 13]));
  });

  it("should throw errors for bad input", () => {
    expect(() => decodeHex("cafed00d")).toThrow('String should start with "\\x"');

    expect(() => decodeHex("\\x12345")).toThrow("String should be an even number of characters");

    expect(() => decodeHex("\\xabcdefgh")).toThrow("String should only contain hex characters");
  });
});

describe("getSize", () => {
  it("returns the correct value", () => {
    expect(getSize(1)).toBe(1);
    expect(getSize(7)).toBe(2);
    expect(getSize(19)).toBe(3);
    expect(getSize(37)).toBe(4);
    expect(getSize(217)).toBe(9);
    expect(getSize(547)).toBe(14);
  });
});

describe("getLayout", () => {
  it("puts one hexagon in the center", () => {
    expect(getLayout(1)).to.deep.equal([[0, 0]]);
  });

  it("lays out 7 hexagons correctly", () => {
    const sqrt3 = round(Math.sqrt(3));
    const halfSqrt3 = round(Math.sqrt(3) / 2);

    expect(getLayout(2)).to.deep.equal([
      [-halfSqrt3, -1.5],
      [halfSqrt3, -1.5],
      [-sqrt3, 0],
      [0, 0],
      [sqrt3, 0],
      [-halfSqrt3, 1.5],
      [halfSqrt3, 1.5],
    ]);
  });
});

describe("getAdjacentCells", () => {
  it("finds the 6 cells around a cell on the top half", () => {
    expect(getAdjacentCells(217, 48)).to.deep.equal([35, 36, 47, 49, 61, 62]);
    expect(getAdjacentCells(217, 51)).to.deep.equal([38, 39, 50, 52, 64, 65]);
  });

  it("finds the 6 cells around a cell on the bottom half", () => {
    expect(getAdjacentCells(217, 168)).to.deep.equal([181, 180, 169, 167, 155, 154]);
    expect(getAdjacentCells(217, 120)).to.deep.equal([136, 135, 121, 119, 104, 103]);
  });

  it("finds the 6 cells around the center cell", () => {
    expect(getAdjacentCells(217, 108)).to.deep.equal([91, 92, 107, 109, 124, 125]);
  });

  it("finds the 6 cells around the center cell on a larger board", () => {
    expect(getAdjacentCells(271, 135)).to.deep.equal([116, 117, 134, 136, 153, 154]);
  });

  it("finds the 4 cells around a top edge", () => {
    expect(getAdjacentCells(217, 3)).to.deep.equal([2, 4, 12, 13]);
  });

  it("finds the 4 cells around a bottom edge", () => {
    expect(getAdjacentCells(217, 212)).to.deep.equal([213, 211, 203, 202]);
  });

  it("finds the 4 cells around a side edge", () => {
    expect(getAdjacentCells(217, 55)).to.deep.equal([42, 56, 69, 70]);
    expect(getAdjacentCells(217, 54)).to.deep.equal([41, 53, 67, 68]);
    expect(getAdjacentCells(217, 162)).to.deep.equal([175, 163, 149, 148]);
    expect(getAdjacentCells(217, 207)).to.deep.equal([216, 206, 197, 196]);
  });

  it("finds the 3 cells around a corner", () => {
    expect(getAdjacentCells(217, 0)).to.deep.equal([1, 9, 10]);
    expect(getAdjacentCells(217, 8)).to.deep.equal([7, 17, 18]);
    expect(getAdjacentCells(217, 100)).to.deep.equal([84, 101, 117]);
  });
});

describe("generateBoard", () => {
  it("generates a size 9 board with 9 towers for 2 player", () => {
    const { towers, cells } = generateBoard(2);
    expect(cells.length).toBe(217);
    expect(towers.length).toBe(9);
  });

  it("generates a size 10 board with 13 towers for 3 player", () => {
    const { towers, cells } = generateBoard(3);
    expect(cells.length).toBe(271);
    expect(towers.length).toBe(13);
  });

  it("generates a size 13 board with 25 towers for 6 player", () => {
    const { towers, cells } = generateBoard(6);
    expect(cells.length).toBe(469);
    expect(towers.length).toBe(25);
  });

  it("should use the Math.random function to determine the locations of the towers", () => {
    const random = seededRandom(1234);
    vi.spyOn(Math, "random").mockImplementation(() => random());

    const actual = generateBoard(2);

    actual.towers.sort((a, b) => a - b);

    const expected = fromEmoji`
              ⚫⚫⚫⚫⚫⚫⚫⚫⚫
             ⚫⚫⚫⚫⚫⚫🔲⚫⚫⚫
            ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
           ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
          ⚫⚫⚫🔲⚫⚫⚫⚫⚫⚫🔲⚫⚫
         ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫⚫⚫⚫🔲⚫⚫⚫⚫⚫⚫
      ⚫🔲⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫🔲⚫
       ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
         ⚫⚫⚫🔲⚫⚫⚫⚫⚫⚫⚫🔲⚫⚫
          ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
           ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
            ⚫⚫⚫⚫⚫🔲⚫⚫⚫⚫⚫
             ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
              ⚫⚫⚫⚫⚫⚫⚫⚫⚫
    `;

    expect(actual).to.deep.equal(expected);
  });
});

describe("countTowers", () => {
  it("finds nothing for an empty", () => {
    expect(
      countTowers(fromEmoji`
           ⚫⚫⚫⚫
          ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫⚫⚫
          ⚫⚫⚫⚫⚫
           ⚫⚫⚫⚫
      `),
    ).to.deep.equal([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("finds nothing for board with no towers", () => {
    expect(
      countTowers(fromEmoji`
           ⚫🔴⚫⚫
          ⚫⚫🔴🔵⚫
         ⚫⚫⚫🔴🔵⚫
        🟢🟢⚫🔴⚫🔵🔵
         ⚫⚫⚫⚫🟢⚫
          🔵🔵⚫🟢🟢
           ⚫⚫⚫⚫
      `),
    ).to.deep.equal([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("finds towers on a board with towers", () => {
    expect(
      countTowers(fromEmoji`
           ⚫🟥⚫⚫
          🔲⚫🔴🔵⚫
         ⚫⚫⚫🟥🔵🔲
        🟢🟢⚫🔴⚫🔵🔵
         ⚫🔲⚫⚫⚫⚫
          🔵🔵⚫🟢🟢
           ⚫⚫🟢🟩
      `),
    ).to.deep.equal([3, 2, 0, 1, 0, 0, 0, 0]);
  });
});

describe("getMaxTurnSize", () => {
  it("limits turns at the beginning of the game", () => {
    expect(getMaxTurnSize(0, 0)).toBe(1);
    expect(getMaxTurnSize(1, 0)).toBe(2);
    expect(getMaxTurnSize(2, 0)).toBe(3);
    expect(getMaxTurnSize(3, 0)).toBe(4);
    expect(getMaxTurnSize(4, 0)).toBe(4);
  });

  it("limits turns based on towers captured", () => {
    expect(getMaxTurnSize(100, 0)).toBe(4);
    expect(getMaxTurnSize(100, 1)).toBe(4);
    expect(getMaxTurnSize(100, 2)).toBe(3);
    expect(getMaxTurnSize(100, 3)).toBe(2);
    expect(getMaxTurnSize(100, 4)).toBe(1);
  });

  it("limits turns based on towers captured and beginning of game", () => {
    expect(getMaxTurnSize(0, 0)).toBe(1);
    expect(getMaxTurnSize(2, 2)).toBe(3);
    expect(getMaxTurnSize(3, 2)).toBe(3);
    expect(getMaxTurnSize(4, 2)).toBe(3);
    expect(getMaxTurnSize(3, 4)).toBe(1);
  });
});

describe("doTurn", () => {
  it("should update the board at the designated indexes", () => {
    const board = fromEmoji`
         ⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
      ⚫⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `;

    expect(doTurn(board, [0, 4, 9], Color.RED)).toBe(0);

    expect(board).to.deep.equal(fromEmoji`
         🔴⚫⚫⚫
        🔴⚫⚫⚫⚫
       🔴⚫⚫⚫⚫⚫
      ⚫⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `);
  });

  it("should throw error if cell is already claimed", () => {
    const board = fromEmoji`
         🔵⚫⚫⚫
        ⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
      ⚫⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `;

    expect(() => doTurn(board, [0], Color.RED)).toThrow(InvalidTurnError);
  });

  it("should throw error if cell is tower", () => {
    const board = fromEmoji`
         🔲⚫⚫⚫
        ⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
      ⚫⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `;

    expect(() => doTurn(board, [0], Color.RED)).toThrow(InvalidTurnError);
  });

  it("should claim any connected towers and return the number of towers claimed", () => {
    const board = fromEmoji`
         ⚫⚫⚫⚫
        ⚫🔲⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
      🔲⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `;

    expect(doTurn(board, [0, 4, 9], Color.RED)).toBe(2);

    expect(board).to.deep.equal(fromEmoji`
         🔴⚫⚫⚫
        🔴🟥⚫⚫⚫
       🔴⚫⚫⚫⚫⚫
      🟥⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `);
  });

  it("should claim any towers connected towers claimed by the same color", () => {
    const board = fromEmoji`
         ⚫⚫⚫⚫
        ⚫🟥⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
      🔲⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `;

    expect(doTurn(board, [0, 4, 9], Color.RED)).toBe(1);

    expect(board).to.deep.equal(fromEmoji`
         🔴⚫⚫⚫
        🔴🟥⚫⚫⚫
       🔴⚫⚫⚫⚫⚫
      🟥⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `);
  });

  it("should not claim connected towers that are already claimed by another color", () => {
    const board = fromEmoji`
         ⚫⚫⚫⚫
        ⚫🟦⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
      🔲⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `;

    expect(doTurn(board, [0, 4, 9], Color.RED)).toBe(0);

    expect(board).to.deep.equal(fromEmoji`
         🔴⚫⚫⚫
        🔴🟦⚫⚫⚫
       🔴⚫⚫⚫⚫⚫
      🔲⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫⚫⚫
         ⚫⚫⚫⚫
    `);
  });

  it("should not claim towers that are not connected", () => {
    const board = fromEmoji`
         ⚫⚫⚫⚫
        ⚫🔲⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
      🔲⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫⚫⚫⚫
        ⚫⚫⚫🔲⚫
         ⚫⚫⚫⚫
    `;

    expect(doTurn(board, [4, 9, 11, 25], Color.RED)).toBe(2);

    expect(board).to.deep.equal(fromEmoji`
         ⚫⚫⚫⚫
        🔴🟥⚫⚫⚫
       🔴⚫🔴⚫⚫⚫
      🟥⚫⚫⚫⚫⚫⚫
       ⚫⚫⚫🔴⚫⚫
        ⚫⚫⚫🔲⚫
         ⚫⚫⚫⚫
    `);
  });
});
