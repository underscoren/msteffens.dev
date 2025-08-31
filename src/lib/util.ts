export const toHex = (num: number, chars = 2) => num.toString(16).padStart(chars, "0");
export const toBinary = (num: number, bits = 8) => num.toString(2).padStart(bits, "0");