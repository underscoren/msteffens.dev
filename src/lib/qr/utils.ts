import type { PatternName } from "./patterns";

/** Creates a filled square 2D array */
export const square2DArray = <T>(size: number, fill: T) =>
    Array.from({ length: size }, () => new Array(size).fill(fill)) as T[][];

/** Default hues for each pattern */
export const patternHues: Record<PatternName, number> = {
    finder: 240,
    alignment: 118,
    format: 58,
    darkModule: 300,
    timing: 2,
    version: 24,
};

export type GroupColor = { blockHue: number; byteValue: number; byte: string };

/** Calculates the hue and value for a given byte in a group / block */
export const groupColor = (
    group: number,
    block: number,
    byte: number,
    groups: [number, number][]
) => {
    const maxBlocks = groups.map((g) => g[0]).reduce((a, b) => a + b, 0);
    const maxBytes = groups[group][1];

    // sum up the previous groups, if any
    const previous = groups
        .slice(0, group)
        .map((g) => g[0])
        .reduce((a, b) => a + b, 0);
    const blockIndex = previous + block;

    const minHue = 30; // so we don't get too close to red
    const blockHue = ((360 - minHue) / maxBlocks) * blockIndex + minHue;

    const minValue = 30;
    const maxValue = 70;
    const betweenValue = maxValue - minValue;
    const byteValue = betweenValue - (betweenValue / maxBytes) * byte + minValue;

    return { blockHue, byteValue } as GroupColor;
};
