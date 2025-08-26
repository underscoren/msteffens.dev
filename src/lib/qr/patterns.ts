import { alignmentPatterns, versionFromSize, type Bit, type BitArray2D } from "./data";
import { square2DArray } from "./utils";

export const allPatterns = [
    "finder",
    "timing",
    "alignment",
    "version",
    "format",
    "darkModule",
] as const;

export type PatternName = typeof allPatterns[number];

/** Mutates a rectangular region of the mask to 1 */
function setRectangular(maskBits: BitArray2D, startX: number, startY: number, endX: number, endY: number) {
  for (let y = startY; y < endY; y++) 
    for (let x = startX; x < endX; x++) 
      maskBits[y][x] = 1;
};

/** Mutates a square region of the mask to 1 */
function setSquare(maskBits: BitArray2D, x: number, y: number, size: number) {
  setRectangular(maskBits, x, y, x + size, y + size);
}

const patternFuncMap: Record<PatternName | "simpleMask", (size: number) => BitArray2D> = {
  "finder": getFinderMask,
  "timing": getTimingMask,
  "alignment": getAlignmentMask,
  "darkModule": getDarkModuleMask,
  "format": getFormatMask,
  "version": getVersionMask,
  "simpleMask": getSimpleMask
}

/**
 * Creates a mask for a given pattern of functional modules
 * @param size The size of the QR code in modules
 * @param patternName The name of the pattern to generate
 */
export function getPatternMask(size: number, patternName: PatternName | "simpleMask") {
  const maskFunc = patternFuncMap[patternName];
  return maskFunc(size);
};

/** Size of the finder pattern, in modules */
const FINDER_SIZE = 8 as const;

/** Generates a finder pattern bit mask for a given QR code size */
export function getFinderMask(size: number) {
  const maskBits = square2DArray<Bit>(size, 0);

  const endOffset = size - FINDER_SIZE;

  const positions: [number, number][] = [
    [0, 0],
    [endOffset, 0],
    [0, endOffset],
  ];

  for (const [x, y] of positions) 
    setSquare(maskBits, x, y, FINDER_SIZE);
  
  return maskBits;
}

/** Generates a timing pattern mask for a given QR code size */
export function getTimingMask(size: number) {
  const maskBits = square2DArray<Bit>(size, 0);
  
  const endOffset = size - FINDER_SIZE;
  const timingPos = 6; // position of the timing pattern relative to the start of each axis

  setRectangular(maskBits, timingPos, FINDER_SIZE, timingPos+1, endOffset);
  setRectangular(maskBits, FINDER_SIZE, timingPos, endOffset, timingPos+1);

  return maskBits;
}

/** Generates a alignment pattern mask for a given QR code size */
export function getAlignmentMask(size: number) {
  const maskBits = square2DArray<Bit>(size, 0);

  /** QR code version */
  const version = versionFromSize(size);
  /** Array of coordinates of alignment pattern centers */
  const patternPos = alignmentPatterns[version];
  /** Last coordinate inside the QR code */
  const end = size - 1;
  /** Offset from the start where alignment patterns begin */
  const startOffset = 6;

  // iterate through all alignment patterns to generate all permutations
  for (const x of patternPos)
    for (const y of patternPos) {
      // filter disallowed positions
      if (
          (x == startOffset && y == startOffset) || 
          (x == startOffset && y == end - startOffset) || 
          (x == end - startOffset && y == startOffset)
        )
          continue;

      // the coordinates are for the center, but setSquare works from the top-left corner
      setSquare(maskBits, x - 2, y - 2, 5);
    }
  
  return maskBits;
}

/** Generates a dark module mask for a given QR code size */
export function getDarkModuleMask(size: number) {
  const maskBits = square2DArray<Bit>(size, 0);

  // top-left corner of the bottom-left finder pattern
  maskBits[size - FINDER_SIZE][FINDER_SIZE] = 1;

  return maskBits;
}

/** Generates a format bits mask for a given QR code size */
export function getFormatMask(size: number) {
  const maskBits = square2DArray<Bit>(size, 0);

  // around the top-left finder pattern (ignoring the timing pattern)
  setRectangular(maskBits, 0, FINDER_SIZE, 6, FINDER_SIZE + 1);
  setRectangular(maskBits, 7, FINDER_SIZE, 9, FINDER_SIZE + 1);
  setRectangular(maskBits, 8, 7, 9, 8);
  setRectangular(maskBits, 8, 0, 9, 6);

  // next to the bottom-left finder pattern
  setRectangular(maskBits, FINDER_SIZE, size - FINDER_SIZE + 1, FINDER_SIZE + 1, size);

  // below the top-right finder pattern
  setRectangular(maskBits, size - FINDER_SIZE, 8, size, 9);
  
  return maskBits;
}

/** Generates a version bits mask for a given QR code size */
export function getVersionMask(size: number) {
  const maskBits = square2DArray<Bit>(size, 0);

  // above the bottom-left finder pattern
  setRectangular(maskBits, 0, size - FINDER_SIZE - 3, 6, size - FINDER_SIZE);

  // to the left of the top-right finder pattern
  setRectangular(maskBits, size - FINDER_SIZE - 3, 0, size - FINDER_SIZE, 6);

  return maskBits;
}

/** Generates a simplified mask for a given QR code size */
export function getSimpleMask(size: number) {
  const maskBits = square2DArray<Bit>(size, 0);

  const version = versionFromSize(size)
  const end = size - 1;

  // finder pattern + version block
  setRectangular(maskBits, end - 11, 0, size, 7);

  // bottom border of qr code and format bits
  setRectangular(maskBits, end - 8, 7, size, 9);

  // horizontal timing pattern
  setRectangular(maskBits, 9, 6, end - 11, 7);

  const patternPos = alignmentPatterns[version];

  // iterate through all alignment patterns to generate all permutations
  for (const x of patternPos)
    for (const y of patternPos) {
      // filter disallowed positions
      if ((x == 6 && y == 6) || (x == 6 && y == end - 6) || (x == end - 6 && y == 6))
        continue;

      // the coordinates are for the center, but setSquare
      // start from the top-left corner
      setSquare(maskBits, x - 2, y - 2, 5);
    }
  
  return maskBits;
}

/**
 * Performs a binary OR for each bit on both masks, and returns the 
 * resulting combined mask
 */
export function combineMask(a: BitArray2D, b: BitArray2D) {
  return a.map((line, y) => 
    line.map((bit, x) => 
      b[y][x] | bit
    )
  ) as BitArray2D;
}