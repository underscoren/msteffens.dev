export const toByte = (bits: string) => parseInt(bits, 2).toString(16).padStart(2, "0");
