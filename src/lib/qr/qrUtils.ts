export type BlockCharacter = " " | "\u2580" | "\u2584" | "\u2588";

export const blockMap: {[index: string]: number} = {
    " ": 0,
    "\u2580": 1,
    "\u2584": 2,
    "\u2588": 3
}

export const getModule = (x: number, y: number, QRLines: BlockCharacter[][]) => {
    const char = QRLines[~~(y / 2)][x];

    return ((blockMap[char] >> (y & 1)) & 1) as Bit;
}

// the possible coordinates of each alignment pattern for each version
const alignmentPatterns: (number[] | null)[] = [
    null,
    null,
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    // not gonna need larger than version 10 realistically
    // the remainder here are for completeness
    // [6, 30, 54],
    // [6, 32, 58],
    // [6, 34, 62],
    // [6, 26, 46, 66],
    // [6, 26, 48, 70],
    // [6, 26, 50, 74],
    // [6, 30, 54, 78],
    // [6, 30, 56, 82],
    // [6, 30, 58, 86],
    // [6, 34, 62, 90],
    // [6, 28, 50, 72, 94],
    // [6, 26, 50, 74, 98],
    // [6, 30, 54, 78, 102],
    // [6, 28, 54, 80, 106],
    // [6, 32, 58, 84, 110],
    // [6, 30, 58, 86, 114],
    // [6, 34, 62, 90, 118],
    // [6, 26, 50, 74, 98],
    // [6, 30, 54, 78, 102, 126],
    // [6, 26, 52, 78, 104, 130],
    // [6, 30, 56, 82, 108, 134],
    // [6, 34, 60, 86, 112, 138],
    // [6, 30, 58, 86, 114, 142],
    // [6, 34, 62, 90, 118, 146],
    // [6, 30, 54, 78, 102, 126, 150],
    // [6, 24, 50, 76, 102, 128, 154],
    // [6, 28, 54, 80, 106, 132, 158],
    // [6, 32, 58, 84, 110, 136, 162],
    // [6, 26, 54, 82, 110, 138, 166],
    // [6, 30, 58, 86, 114, 142, 170]
]

/** Generate a filled square 2D array */
export const square2DArray = <T>(size: number, fill: T) => Array.from(
    {length: size}, 
    () => new Array(size).fill(fill)
) as T[][];

export type PatternName = "finder" | "alignment" | "timing" | "version" | "format" | "darkModule";
export type Bit = 0 | 1

export const allPatterns = ["finder", "timing", "alignment", "version", "format", "darkModule"] as PatternName[];

/**
 * Creates a 2D mask array in the same dimensions as the QR code to 
 * @param size The size of the QR code in modules
 * @param patternName The name of the pattern to return a mask for
 * @returns {Bit[][]} mask 2D array
 */
export const getPatternMask = (size: number, patternName: PatternName | "simpleMask") => {
    const maskArray = square2DArray<Bit>(size, 0);
    
    /**
     * Sets a rectangular region of the mask to 1s
     * @param {[number, number, number, number]} coord the rectangular coordinates to set
     */
    const setRectangular = ([startX, startY, endX, endY]: [number, number, number, number]) => {
        for(let y = startY; y < endY; y++)
            for(let x = startX; x < endX; x++)
                maskArray[y][x] = 1;
    }

    /**
     * Sets a square region of the mask to 1s
     * @param {[number, number]} coords the start coordinates
     * @param {number} size the size of the square region
     */
    const setSquare = ([startX, startY]: [number, number], size: number) => setRectangular([startX, startY, startX+size, startY+size]);
    
    const version = ((size - 21) / 4) + 1;
    const end = size - 1;
    const FINDER_SIZE = 8;

    if(patternName == "finder") {
        const offset = size - FINDER_SIZE;
        
        const positions = [
            [0, 0], 
            [offset, 0],
            [0, offset]
        ] as [number, number][];

        for(const coords of positions)
            setSquare(coords, FINDER_SIZE);
    }

    if(patternName == "timing") {

        setRectangular([6, FINDER_SIZE, 7, size-FINDER_SIZE]);
        setRectangular([FINDER_SIZE, 6, size-FINDER_SIZE, 7]);
    }

    if(patternName == "alignment") {
        const patternPos = alignmentPatterns[version] as number[];

        // iterate through all alignment patterns to generate all permutations
        for(const x of patternPos)
            for(const y of patternPos) {
                // filter disallowed positions
                if(
                    (x == 6 && y == 6) ||
                    (x == 6 && y == end - 6) ||
                    (x == end - 6 && y == 6)
                )
                    continue;
                
                // the coordinates are for the center, but setSquare works from the top-left corner 
                setSquare([x-2, y-2], 5);
            }
    
    }
    
    if(patternName == "darkModule") {
        // to the top-left corner of the bottom-left finder pattern
        maskArray[size - FINDER_SIZE][FINDER_SIZE] = 1;
    }

    if(patternName == "format") {
        // around the top-left finder pattern
        setRectangular([0, FINDER_SIZE, 6, FINDER_SIZE+1]);
        setRectangular([7, FINDER_SIZE, 9, FINDER_SIZE+1]);
        setRectangular([8, 7, 9, 8]);
        setRectangular([8, 0, 9, 6]);

        // next to the bottom-left finder pattern
        setRectangular([FINDER_SIZE, size-FINDER_SIZE+1, FINDER_SIZE+1, size]);

        // below the top-right finder pattern
        setRectangular([size-FINDER_SIZE, 8, size, 9]);
    }

    if(patternName == "version") {
        // above the bottom-left finder pattern
        setRectangular([0, size-FINDER_SIZE-3, 6, size-FINDER_SIZE]);

        // to the left of the top-right finder pattern
        setRectangular([size-FINDER_SIZE-3, 0, size-FINDER_SIZE, 6]);
    }


    // simplified mask
    if(patternName == "simpleMask") {
        // finder pattern + version block
        setRectangular([end - 11, 0, size, 7]);

        // bottom border of qr code and format bits
        setRectangular([end - 8, 7, size, 9]);

        // horizontal timing pattern
        setRectangular([9, 6, end - 11, 7]);

        const patternPos = alignmentPatterns[version] as number[];

        // iterate through all alignment patterns to generate all permutations
        for(const x of patternPos)
            for(const y of patternPos) {
                // filter disallowed positions
                if(
                    (x == 6 && y == 6) ||
                    (x == 6 && y == end - 6) ||
                    (x == end - 6 && y == 6)
                )
                    continue;
                
                // the coordinates are for the center, but setSquare 
                // start from the top-left corner 
                setSquare([x-2, y-2], 5);
            }
    }

    return maskArray;
}

/** 
 * Performs a binary OR for each bit on both masks, 
 * and returns the resulting combined mask 
 */
export const combineMask = (a: Bit[][], b: Bit[][]) => 
    a.map((line, y) => 
        line.map((bit, x) => b[y][x] | bit) 
    ) as Bit[][];

/** Default hues for each pattern */
export const defaultHues: Record<PatternName, number> = {
    finder: 240,
    alignment: 118,
    format: 58,
    darkModule: 300,
    timing: 2,
    version: 24
};

/** 
 * Contains the number of blocks and data codewords per block for each group,
 * for each error correction level, for each QR version
 * 
 * ```
 * [ for each version (2-10)
 *   [ for each EC level (L-H)
 *      [ for each group (1 or more)
 *       [number of blocks, codewords per block] // tuple
 *      ]
 *   ],
 * ]
 * ```
 */
export const codewordGroups: [number, number][][][] = [
    [], // no QR version 0
    [ // version 1
        [[1,19]], // L
        [[1,16]], // M
        [[1,13]], // Q
        [[1,9]],  // H
    ],
    [ // 2
        [[1,34]],
        [[1,28]],
        [[1,22]],
        [[1,16]],
    ],
    [ // 3
        [[1,55]],
        [[1,44]],
        [[2,17]],
        [[2,13]],
    ],
    [ // 4
        [[1,80]],
        [[2,32]],
        [[2,24]],
        [[4,9]],
    ],
    [ // 5
        [[1,108]],
        [[2,43]],
        [[2,15],[2,16]],
        [[2,11],[2,12]],
    ],
    [ // 6
        [[2,68]],
        [[4,27]],
        [[4,19]],
        [[4,15]],
    ],
    [ // 7
        [[2,78]],
        [[4,31]],
        [[2,14],[4,15]],
        [[4,13],[1,14]],
    ],
    [ // 8
        [[2,97]],
        [[2,38],[2,39]],
        [[4,18],[2,19]],
        [[4,14],[2,15]],
    ],
    [ // 9
        [[2,116]],
        [[3,36],[2,37]],
        [[4,16],[4,17]],
        [[4,12],[4,13]],
    ],
    [ // 10
        [[2,68],[2,69]],
        [[4,43],[1,44]],
        [[6,19],[2,20]],
        [[6,15],[2,16]]
    ],
    // i can't be bothered to transcribe any more :P
    // look em up at https://www.thonky.com/qr-code-tutorial/error-correction-table
]

// taken from https://www.thonky.com/qr-code-tutorial/mask-patterns
// NB: ~~ is shorthand for Math.floor
export const maskFormulae = [
    (x: number, y: number) => (y + x) % 2 == 0,
    (x: number, y: number) => y % 2 == 0,
    (x: number) => x % 3 == 0,
    (x: number, y: number) => (y + x) % 3 == 0,
    (x: number, y: number) => (~~(y/2) + ~~(x/3)) % 2 == 0,
    (x: number, y: number) => ((y*x) % 2 + (y*x) % 3) == 0,
    (x: number, y: number) => ((y*x) % 2 + (y*x) % 3) % 2 == 0,
    (x: number, y: number) => ((y+x) % 2 + (y*x) % 3) % 2 == 0,
]

export type QRReadType = "read" | "skipped";
export type QRReadHistory = [number, number, QRReadType];

export type GroupColor =  { blockHue: number, byteValue: number, byte: string };

/** Calculates the hue and value for a given byte in a group / block */
export const groupColor = (group: number, block: number, byte: number, groups: [number, number][]) => {
    const maxBlocks = groups.map(g => g[0]).reduce((a,b) => a+b, 0);
    const maxBytes = groups[group][1];

    // sum up the previous groups, if any
    const previous = groups.slice(0, group).map(g => g[0]).reduce((a,b) => a + b, 0); 
    const blockIndex = previous + block; 

    const minHue = 30; // so we don't get too close to red
    const blockHue = ((360 - minHue) / maxBlocks) * blockIndex + minHue;
    
    const minValue = 30;
    const maxValue = 70;
    const betweenValue = maxValue - minValue;
    const byteValue = betweenValue - (betweenValue / maxBytes) * byte + minValue;

    return { blockHue, byteValue } as GroupColor;
}

