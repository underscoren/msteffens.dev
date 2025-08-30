export type BlockCharacter = " " | "\u2580" | "\u2584" | "\u2588";
export type QRBlockArray = BlockCharacter[][];

export const blockMap: Record<BlockCharacter, number> = {
  " ": 0,
  "\u2580": 1,
  "\u2584": 2,
  "\u2588": 3,
} as const;

export type Bit = 0 | 1;
/** A 2D array of 0s and 1s, representing modules in a QR code */
export type BitArray2D = Bit[][];

/** Error correction levels */
export const ecLevels = ["L", "M", "Q", "H"] as const;
export type ECLevel = typeof ecLevels[number];

/** Error correction level ordered by the error correction level index */
export const ecLevelsOrdered = ["M", "L", "H", "Q"] as ECLevel[];

/** Metadata about groups */
export type GroupDef = {
  /** Number of blocks in the group */
  blocks: number,
  /** Number of codewords in each block */
  codewords: number
}

/** Metadata for a given error correction level */
export type ECData = {
  /** The number of error correction codewords per block */
  ecCodewords: number,
  /** Data about each group of data and error correction codewords */
  groups: GroupDef[]
}

/** 
 * The groups, blocks per group, and codewords per block for both data and error
 * correction, for all versions and all error correction levels
 */
export const versionGroupsBlocks: Record<ECLevel, ECData>[] = [
  null, // version 0 doesn't exist
  { // version 1
    L: { ecCodewords: 7,  groups: [{blocks: 1,  codewords: 19}] }, 
    M: { ecCodewords: 10, groups: [{blocks: 1,  codewords: 16}] }, 
    Q: { ecCodewords: 13, groups: [{blocks: 1,  codewords: 13}] }, 
    H: { ecCodewords: 17, groups: [{blocks: 1,  codewords: 9}] } 
  },
  { 
    L: { ecCodewords: 10, groups: [{blocks: 1,  codewords: 34}] }, 
    M: { ecCodewords: 16, groups: [{blocks: 1,  codewords: 28}] }, 
    Q: { ecCodewords: 22, groups: [{blocks: 1,  codewords: 22}] }, 
    H: { ecCodewords: 28, groups: [{blocks: 1,  codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 15, groups: [{blocks: 1,  codewords: 55}] }, 
    M: { ecCodewords: 26, groups: [{blocks: 1,  codewords: 44}] }, 
    Q: { ecCodewords: 18, groups: [{blocks: 2,  codewords: 17}] }, 
    H: { ecCodewords: 22, groups: [{blocks: 2,  codewords: 13}] } 
  },
  { 
    L: { ecCodewords: 20, groups: [{blocks: 1,  codewords: 80}] }, 
    M: { ecCodewords: 18, groups: [{blocks: 2,  codewords: 32}] }, 
    Q: { ecCodewords: 26, groups: [{blocks: 2,  codewords: 24}] }, 
    H: { ecCodewords: 16, groups: [{blocks: 4,  codewords: 9}] } 
  },
  { 
    L: { ecCodewords: 26, groups: [{blocks: 1,  codewords: 108}] }, 
    M: { ecCodewords: 24, groups: [{blocks: 2,  codewords: 43}] }, 
    Q: { ecCodewords: 18, groups: [{blocks: 2,  codewords: 15}, {blocks: 2, codewords: 16}] }, 
    H: { ecCodewords: 22, groups: [{blocks: 2,  codewords: 11}, {blocks: 2, codewords: 12}] } 
  },
  { 
    L: { ecCodewords: 18, groups: [{blocks: 2,  codewords: 68}] }, 
    M: { ecCodewords: 16, groups: [{blocks: 4,  codewords: 27}] }, 
    Q: { ecCodewords: 24, groups: [{blocks: 4,  codewords: 19}] }, 
    H: { ecCodewords: 28, groups: [{blocks: 4,  codewords: 15}] } 
  },
  { 
    L: { ecCodewords: 20, groups: [{blocks: 2,  codewords: 78}] }, 
    M: { ecCodewords: 18, groups: [{blocks: 4,  codewords: 31}] }, 
    Q: { ecCodewords: 18, groups: [{blocks: 2,  codewords: 14}, {blocks: 4,  codewords: 15}] }, 
    H: { ecCodewords: 26, groups: [{blocks: 4,  codewords: 13}, {blocks: 1,  codewords: 14}] } 
  },
  { 
    L: { ecCodewords: 24, groups: [{blocks: 2,  codewords: 97}] }, 
    M: { ecCodewords: 22, groups: [{blocks: 2,  codewords: 38}, {blocks: 2,  codewords: 39}] }, 
    Q: { ecCodewords: 22, groups: [{blocks: 4,  codewords: 18}, {blocks: 2,  codewords: 19}] }, 
    H: { ecCodewords: 26, groups: [{blocks: 4,  codewords: 14}, {blocks: 2,  codewords: 15}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 2,  codewords: 116}] }, 
    M: { ecCodewords: 22, groups: [{blocks: 3,  codewords: 36}, {blocks: 2,  codewords: 37}] }, 
    Q: { ecCodewords: 20, groups: [{blocks: 4,  codewords: 16}, {blocks: 4,  codewords: 17}] }, 
    H: { ecCodewords: 24, groups: [{blocks: 4,  codewords: 12}, {blocks: 4,  codewords: 13}] } 
  },
  { 
    L: { ecCodewords: 18, groups: [{blocks: 2,  codewords: 68},  {blocks: 2, codewords: 69}] }, 
    M: { ecCodewords: 26, groups: [{blocks: 4,  codewords: 43}, {blocks: 1,  codewords: 44}] }, 
    Q: { ecCodewords: 24, groups: [{blocks: 6,  codewords: 19}, {blocks: 2,  codewords: 20}] }, 
    H: { ecCodewords: 28, groups: [{blocks: 6,  codewords: 15}, {blocks: 2,  codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 20, groups: [{blocks: 4,  codewords: 81}] }, 
    M: { ecCodewords: 30, groups: [{blocks: 1,  codewords: 50}, {blocks: 4,  codewords: 51}] }, 
    Q: { ecCodewords: 28, groups: [{blocks: 4,  codewords: 22}, {blocks: 4,  codewords: 23}] }, 
    H: { ecCodewords: 24, groups: [{blocks: 3,  codewords: 12}, {blocks: 8,  codewords: 13}] } 
  },
  { 
    L: { ecCodewords: 24, groups: [{blocks: 2,  codewords: 92},  {blocks: 2, codewords: 93}] }, 
    M: { ecCodewords: 22, groups: [{blocks: 6,  codewords: 36}, {blocks: 2,  codewords: 37}] }, 
    Q: { ecCodewords: 26, groups: [{blocks: 4,  codewords: 20}, {blocks: 6,  codewords: 21}] }, 
    H: { ecCodewords: 28, groups: [{blocks: 7,  codewords: 14}, {blocks: 4,  codewords: 15}]} 
  },
  { 
    L: { ecCodewords: 26, groups: [{blocks: 4,  codewords: 107}, ] }, 
    M: { ecCodewords: 22, groups: [{blocks: 8,  codewords: 37}, {blocks: 1,  codewords: 38}] }, 
    Q: { ecCodewords: 24, groups: [{blocks: 8,  codewords: 20}, {blocks: 4,  codewords: 21}] }, 
    H: { ecCodewords: 22, groups: [{blocks: 12, codewords: 11}, {blocks: 4,  codewords: 12}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 3,  codewords: 115}, {blocks: 1,  codewords: 116}] }, 
    M: { ecCodewords: 24, groups: [{blocks: 4,  codewords: 40}, {blocks: 5,  codewords: 41}] }, 
    Q: { ecCodewords: 20, groups: [{blocks: 11, codewords: 16}, {blocks: 5,  codewords: 17}] }, 
    H: { ecCodewords: 24, groups: [{blocks: 11, codewords: 12}, {blocks: 5,  codewords: 13}] } 
  },
  { 
    L: { ecCodewords: 22, groups: [{blocks: 5,  codewords: 87},  {blocks: 1,  codewords: 88}] }, 
    M: { ecCodewords: 24, groups: [{blocks: 5,  codewords: 41}, {blocks: 5,  codewords: 42}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 5,  codewords: 24}, {blocks: 7,  codewords: 25}] }, 
    H: { ecCodewords: 24, groups: [{blocks: 11, codewords: 12}, {blocks: 7,  codewords: 13}] } 
  },
  { 
    L: { ecCodewords: 24, groups: [{blocks: 5,  codewords: 98},  {blocks: 1,  codewords: 99}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 7,  codewords: 45}, {blocks: 3,  codewords: 46}] }, 
    Q: { ecCodewords: 24, groups: [{blocks: 15, codewords: 19}, {blocks: 2,  codewords: 20}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 3,  codewords: 15}, {blocks: 13, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 28, groups: [{blocks: 1,  codewords: 107}, {blocks: 5,  codewords: 108}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 10, codewords: 46}, {blocks: 1,  codewords: 47}] }, 
    Q: { ecCodewords: 28, groups: [{blocks: 1,  codewords: 22}, {blocks: 15, codewords: 23}] }, 
    H: { ecCodewords: 28, groups: [{blocks: 2,  codewords: 14}, {blocks: 17, codewords: 15}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 5,  codewords: 120}, {blocks: 1,  codewords: 121}] }, 
    M: { ecCodewords: 26, groups: [{blocks: 9,  codewords: 43}, {blocks: 4,  codewords: 44}] }, 
    Q: { ecCodewords: 28, groups: [{blocks: 17, codewords: 22}, {blocks: 1,  codewords: 23}] }, 
    H: { ecCodewords: 28, groups: [{blocks: 2,  codewords: 14}, {blocks: 19, codewords: 15}] } 
  },
  { 
    L: { ecCodewords: 28, groups: [{blocks: 3,  codewords: 113}, {blocks: 4,  codewords: 114}] }, 
    M: { ecCodewords: 26, groups: [{blocks: 3,  codewords: 44}, {blocks: 11, codewords: 45}] }, 
    Q: { ecCodewords: 26, groups: [{blocks: 17, codewords: 21}, {blocks: 4,  codewords: 22}] }, 
    H: { ecCodewords: 26, groups: [{blocks: 9,  codewords: 13}, {blocks: 16, codewords: 14}] } 
  },
  { 
    L: { ecCodewords: 28, groups: [{blocks: 3,  codewords: 107}, {blocks: 5,  codewords: 108}] }, 
    M: { ecCodewords: 26, groups: [{blocks: 3,  codewords: 41}, {blocks: 13, codewords: 42}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 15, codewords: 24}, {blocks: 5,  codewords: 25}] }, 
    H: { ecCodewords: 28, groups: [{blocks: 15, codewords: 15}, {blocks: 10, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 28, groups: [{blocks: 4,  codewords: 116}, {blocks: 4,  codewords: 117}] }, 
    M: { ecCodewords: 26, groups: [{blocks: 17, codewords: 42}] }, 
    Q: { ecCodewords: 28, groups: [{blocks: 17, codewords: 22}, {blocks: 6,  codewords: 23}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 19, codewords: 16}, {blocks: 6,  codewords: 17}] } 
  },
  { 
    L: { ecCodewords: 28, groups: [{blocks: 2,  codewords: 111}, {blocks: 7,  codewords: 112}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 17, codewords: 46}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 7,  codewords: 24}, {blocks: 16, codewords: 25}] }, 
    H: { ecCodewords: 24, groups: [{blocks: 34, codewords: 13}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 4,  codewords: 121}, {blocks: 5,  codewords: 122}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 4,  codewords: 47}, {blocks: 14, codewords: 48}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 11, codewords: 24}, {blocks: 14, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 16, codewords: 15}, {blocks: 14, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 6,  codewords: 117}, {blocks: 4,  codewords: 118}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 6,  codewords: 45}, {blocks: 14, codewords: 46}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 11, codewords: 24}, {blocks: 16, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 30, codewords: 16}, {blocks: 2,  codewords: 17}] } 
  },
  { 
    L: { ecCodewords: 26, groups: [{blocks: 8,  codewords: 106}, {blocks: 4,  codewords: 107}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 8,  codewords: 47}, {blocks: 13, codewords: 48}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 7,  codewords: 24}, {blocks: 22, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 22, codewords: 15}, {blocks: 13, codewords: 16}]} 
  },
  { 
    L: { ecCodewords: 28, groups: [{blocks: 10, codewords: 114}, {blocks: 2,  codewords: 115}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 19, codewords: 46}, {blocks: 4,  codewords: 47}] }, 
    Q: { ecCodewords: 28, groups: [{blocks: 28, codewords: 22}, {blocks: 6,  codewords: 23}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 33, codewords: 16}, {blocks: 4,  codewords: 17}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 8,  codewords: 122}, {blocks: 4,  codewords: 123}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 22, codewords: 45}, {blocks: 3,  codewords: 46}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 8,  codewords: 23}, {blocks: 26, codewords: 24}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 12, codewords: 15}, {blocks: 28, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 3,  codewords: 117}, {blocks: 10, codewords: 118}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 3,  codewords: 45}, {blocks: 23, codewords: 46}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 4,  codewords: 24}, {blocks: 31, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 11, codewords: 15}, {blocks: 31, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 7,  codewords: 116}, {blocks: 7,  codewords: 117}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 21, codewords: 45}, {blocks: 7,  codewords: 46}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 1,  codewords: 23}, {blocks: 37, codewords: 24}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 19, codewords: 15}, {blocks: 26, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 5,  codewords: 115}, {blocks: 10, codewords: 116}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 19, codewords: 47}, {blocks: 10, codewords: 48}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 15, codewords: 24}, {blocks: 25, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 23, codewords: 15}, {blocks: 25, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 13, codewords: 115}, {blocks: 3,  codewords: 116}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 2,  codewords: 46}, {blocks: 29, codewords: 47}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 42, codewords: 24}, {blocks: 1,  codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 23, codewords: 15}, {blocks: 28, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 17, codewords: 115}, ] }, 
    M: { ecCodewords: 28, groups: [{blocks: 10, codewords: 46}, {blocks: 23, codewords: 47}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 10, codewords: 24}, {blocks: 35, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 19, codewords: 15}, {blocks: 35, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 17, codewords: 115}, {blocks: 1,  codewords: 116}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 14, codewords: 46}, {blocks: 21, codewords: 47}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 29, codewords: 24}, {blocks: 19, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 11, codewords: 15}, {blocks: 46, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 13, codewords: 115}, {blocks: 6,  codewords: 116}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 14, codewords: 46}, {blocks: 23, codewords: 47}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 44, codewords: 24}, {blocks: 7,  codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 59, codewords: 16}, {blocks: 1,  codewords: 17}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 12, codewords: 121}, {blocks: 7,  codewords: 122}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 12, codewords: 47}, {blocks: 26, codewords: 48}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 39, codewords: 24}, {blocks: 14, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 22, codewords: 15}, {blocks: 41, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 6,  codewords: 121}, {blocks: 14, codewords: 122}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 6,  codewords: 47}, {blocks: 34, codewords: 48}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 46, codewords: 24}, {blocks: 10, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 2,  codewords: 15}, {blocks: 64, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 17, codewords: 122}, {blocks: 4,  codewords: 123}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 29, codewords: 46}, {blocks: 14, codewords: 47}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 49, codewords: 24}, {blocks: 10, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 24, codewords: 15}, {blocks: 46, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 4,  codewords: 122}, {blocks: 18, codewords: 123}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 13, codewords: 46}, {blocks: 32, codewords: 47}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 48, codewords: 24}, {blocks: 14, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 42, codewords: 15}, {blocks: 32, codewords: 16}] } 
  },
  { 
    L: { ecCodewords: 30, groups: [{blocks: 20, codewords: 117}, {blocks: 4,  codewords: 118}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 40, codewords: 47}, {blocks: 7,  codewords: 48}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 43, codewords: 24}, {blocks: 22, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 10, codewords: 15}, {blocks: 67, codewords: 16}] } 
  },
  { // version 40
    L: { ecCodewords: 30, groups: [{blocks: 19, codewords: 118}, {blocks: 6,  codewords: 119}] }, 
    M: { ecCodewords: 28, groups: [{blocks: 18, codewords: 47}, {blocks: 31, codewords: 48}] }, 
    Q: { ecCodewords: 30, groups: [{blocks: 34, codewords: 24}, {blocks: 34, codewords: 25}] }, 
    H: { ecCodewords: 30, groups: [{blocks: 20, codewords: 15}, {blocks: 61, codewords: 16}] } 
  }
];

/** Precomputed version information, including error correction */
export const versionCodes = [
  0b000111110010010100, // version 7
  0b001000010110111100,
  0b001001101010011001,
  0b001010010011010011,
  0b001011101111110110,
  0b001100011101100010,
  0b001101100001000111,
  0b001110011000001101,
  0b001111100100101000,
  0b010000101101111000,
  0b010001010001011101,
  0b010010101000010111,
  0b010011010100110010,
  0b010100100110100110,
  0b010101011010000011,
  0b010110100011001001,
  0b010111011111101100,
  0b011000111011000100,
  0b011001000111100001,
  0b011010111110101011,
  0b011011000010001110,
  0b011100110000011010,
  0b011101001100111111,
  0b011110110101110101,
  0b011111001001010000,
  0b100000100111010101,
  0b100001011011110000,
  0b100010100010111010,
  0b100011011110011111,
  0b100100101100001011,
  0b100101010000101110,
  0b100110101001100100,
  0b100111010101000001,
  0b101000110001101001, // version 40
];

/** Precomputed format data, including error correction, masked */
export const formatCodes = [
  0b101010000010010, // 00000 L / Mask 0
  0b101000100100101, // 00001 
  0b101111001111100, // 00010
  0b101101101001011, // 00011
  0b100010111111001, // 00100
  0b100000011001110, // 00101
  0b100111110010111, // 00110
  0b100101010100000, // 00111
  0b111011111000100, // 01000
  0b111001011110011, // 01001
  0b111110110101010, // 01010
  0b111100010011101, // 01011
  0b110011000101111, // 01100
  0b110001100011000, // 01101
  0b110110001000001, // 01110
  0b110100101110110, // 01111
  0b001011010001001, // 10000
  0b001001110111110, // 10001
  0b001110011100111, // 10010
  0b001100111010000, // 10011
  0b000011101100010, // 10100
  0b000001001010101, // 10101
  0b000110100001100, // 10110
  0b000100000111011, // 10111
  0b011010101011111, // 11000
  0b011000001101000, // 11001
  0b011111100110001, // 11010
  0b011101000000110, // 11011
  0b010010010110100, // 11100
  0b010000110000011, // 11101
  0b010111011011010, // 11110
  0b010101111101101, // 11111 H / Mask 7
];

/** 
 * The positions of the center coordinates of alignment patterns. 
 * They are symmetrical so only one coordinate is required
 */
export const alignmentPatterns: number[][] = [
  null,
  [], // version 1 has no alignment patterns
  [6, 18], // version 2
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170], // version 40
];

export type DataMaskFunc = (x: number, y: number) => boolean

/** Data mask functions */
export const maskFunctions: DataMaskFunc[] = [
    (x: number, y: number) => (y + x) % 2 == 0,
    (x: number, y: number) => y % 2 == 0,
    (x: number) => x % 3 == 0,
    (x: number, y: number) => (y + x) % 3 == 0,
    (x: number, y: number) => (~~(y / 2) + ~~(x / 3)) % 2 == 0, // NB: ~~ is shorthand for Math.floor
    (x: number, y: number) => ((y * x) % 2) + ((y * x) % 3) == 0,
    (x: number, y: number) => (((y * x) % 2) + ((y * x) % 3)) % 2 == 0,
    (x: number, y: number) => (((y + x) % 2) + ((y * x) % 3)) % 2 == 0,
];

/** Calculates the QR version from the width or height in modules */
export const versionFromSize = (size: number) => ((size - 21) / 4) + 1;