import { 
  blockMap, 
  corruptionCharSet, 
  ecLevelsOrdered, 
  formatCodes, 
  maskFunctions, 
  versionGroupsBlocks, 
  type Bit,
  type BitMaybe,
  type BitMaybeArray2D,
  type BlockCharacter,
  type CorruptionChar,
  type DataMaskFunc, 
  type ECLevel, 
  type GroupDef 
} from "./data";
import { allPatterns, combineMask, getPatternMask } from "./patterns";

function isCorruption(char: string): char is CorruptionChar {
  return corruptionCharSet.has(char as CorruptionChar);
}

function isBlockChar(char: string): char is BlockCharacter {
  return char in blockMap;
}

/** Returns the bit value of a module at a given coordinate */
export function getModule(QRTextLines: string[], x: number, y: number): BitMaybe {
  const char = QRTextLines[~~(y / 2)][x];

  if(isCorruption(char))
    return "?";
  if(isBlockChar(char))
    return ((blockMap[char] >> (y & 1)) & 1) as Bit;

  throw new Error(`Unknown character "${char}" at [${~~(y/2)}][${x}]`);
};

export type QRReadOperation = "read" | "skipped";
export type QRReadHistory = {
  x: number
  y: number
  operation: QRReadOperation
};


// setup / metadata

/** Produces a square 2D bit array from QR code encoded in block characters */
export function QRtextToBitArray(QRTextLines: string[]) {
  // assuming QRTextLines does not include any leading/trailing spaces or newlines
  const size = QRTextLines[0].length;

  const bitArray: BitMaybeArray2D = [];
  for(let y = 0; y < size; y++) {
    const line: BitMaybe[] = [];

    for(let x = 0; x < size; x++)
      line.push(getModule(QRTextLines, x, y));

    bitArray.push(line);
  }

  return bitArray;
}

/** Reads the format bits, decodes them, and returns the parsed QR code metadata */
export function readQRMetadata(bitArray: BitMaybeArray2D) {
  // read and decode the format
  const formatBitsTL: BitMaybe[] = [];

  for(let x = 0; x < 6; x++)
    formatBitsTL.push(bitArray[8][x]);

  const cornerCoords = [
    {x: 7, y: 8},
    {x: 8, y: 8},
    {x: 8, y: 7}
  ]

  for(const {x,y} of cornerCoords)
    formatBitsTL.push(bitArray[y][x]);

  for(let y = 5; y >= 0; y--)
    formatBitsTL.push(bitArray[y][8]);

  const formatBitsBR: BitMaybe[] = [];
  const size = bitArray[0].length;
  const end = size - 1;
  
  for(let y = end; y > (end-7); y--)
    formatBitsBR.push(bitArray[y][8]);

  for(let x = (end - 8); x < size; x++)
    formatBitsBR.push(bitArray[8][x]);

  // error correction
  let formatBits = formatBitsTL.map((bit, i) =>
    bit == "?" ? formatBitsBR[i] : bit
  );

  if(formatBits.slice(0,5).indexOf("?") > 0) {

    // still have unknown format bits, pick most similar one
    const possible = formatCodes.filter(format => {
      // check each bit matches, ignoring unknown bits
      for(let i = 0; i < 15; i++) {
        if(formatBits[i] != "?" && formatBits[i] != format[i])
          return false;
        
      }
      return true;
    });

    // if we have more than 1, there's too many errors in the format to correct
    if(possible.length != 1)
      throw new Error("Unable to read QR code: format contains too many errors");
    
    // technically you could perform BCH error correction here for better results
    // but it's unlikely that high levels of corruption happen inside the format

    formatBits = possible[0].split("") as unknown as Bit[];
  }

  const formatRaw = parseInt(formatBits.slice(0,5).join(""), 2);
  const format = formatRaw ^ 0b10101;

  const ecLevelNum = format >> 3;
  const maskNum = format & 0b111;

  const ecLevel = ecLevelsOrdered[ecLevelNum]; // error correction level
  const maskFunc = maskFunctions[maskNum];

  return {
    formatBitsTL, 
    formatBitsBR, 
    formatBits,
    formatRaw,
    format, 
    ecLevelNum, 
    ecLevel, 
    maskNum, 
    maskFunc 
  };  
}

/** 
 * Reads all the data and error correction codewords
 */
export function readQRCodewords(bitArray: BitMaybeArray2D, maskFunc?: DataMaskFunc) {
  const bitstream: BitMaybe[] = [];
  const readHistory: QRReadHistory[] = [];

  // get mask function if necessary
  if(!maskFunc)
    maskFunc = readQRMetadata(bitArray).maskFunc;
  
  const size = bitArray[0].length;

  // Combine all the pattern masks to produce one mask for skipping functional modules
  const skipMask = allPatterns
      .map(name => getPatternMask(size, name))
      .reduce((a,b) => combineMask(a,b));

  let finished = false;
  let x = size - 1; // start in the bottom-right corner
  let y = size - 1;
  let direction: 1 | -1 = -1; // start by going up
  let isLeftColumn = false; // we start in the right-most column

  while(!finished) {
    // get current module and XOR with the mask
    const module = bitArray[y][x];
    const bit = module == "?" ? "?" : (module ^ Number(maskFunc(x, y))) as BitMaybe;
    bitstream.push(bit);
    
    // the current module is read, any following are skipped
    readHistory.push({x,y, operation: "read"});

    // calculate the next module position to read, skipping any functional modules
    do {
      if (isLeftColumn) { // left column
        x++; // move right & vertical
        y += direction;
        isLeftColumn = false;
      } else { // right column
        x--; // move left
        isLeftColumn = true;
      }

      // when we reach the top/bottom edge
      if(y < 0 || y == size) {
        y -= direction; // go back
        direction *= -1; // flip reading direction
        x -= 2; // jump to next column
        isLeftColumn = false;
      }

      // if we are in the 7th column, move left one more to skip the vertical timing pattern
      if(x == 6)
        x--;

      // if we are out of bounds on the x axis there's no more to read
      if(x < 0) {
        finished = true;
        break;
      }
      
      readHistory.push({x,y, operation: "skipped"});
    } while (skipMask[y][x] == 1)
    // remove duplicate from history
    readHistory.pop();
  }

  return { bitstream, readHistory };
}

/** 
 * Takes in the QR message data bitstream and split it into data and error 
 * correction codewords, as well as deinterleaving them
 */
export function deinterleaveBitstream(bitstream: BitMaybe[], version: number, ecLevel: ECLevel) {
  // split the bitstream into data and error correction codewords

  // calculate total number of codewords to read
  const groupData = versionGroupsBlocks[version][ecLevel];

  const totalDataCodewords = groupData.groups.reduce(
    (sum, {blocks, codewords}) => sum + (blocks * codewords), 
    0
  );

  const totalECCodewords = groupData.groups.reduce(
    (sum, {blocks}) => sum + (blocks * groupData.ecCodewords),
    0
  )

  // group 8 bits into codewords
  const groupBits = (bits: BitMaybe[], offset: number, lengthBytes: number) => {
    const bitOffset = offset * 8;
    const codewords: string[] = [];
    let codeword: string[] = [];
    for(let i = 0; i <= (lengthBytes*8); i++) {
      if(i != 0 && i % 8 == 0) {
        codewords.push(codeword.join(""))
        codeword = [];
      }

      if(i == (lengthBytes*8))
        break; // no more bits left
      
      const bit = bits[i+bitOffset];
      codeword.push(bit.toString());
    }

    return codewords;
  }

  const dataInterleaved = groupBits(bitstream, 0, totalDataCodewords);
  const ecInterleaved = groupBits(bitstream, totalDataCodewords, totalECCodewords);
  
  // deinterleave each set of blocks

  const deinterleave = (codewords: string[], groups: GroupDef[]) => {
    // setup group and block arrays
    const data: string[][][] = groups.map(({blocks}) => 
      Array.from({length: blocks}, () => [])
    );

    // put each codeword into each block in each group, sequentially
    let currentBlock = 0;
    let currentGroup = 0;

    let i = 0;
    while(true) {
      data[currentGroup][currentBlock].push(codewords[i]);
      
      i++;
      if(i >= codewords.length)
        break; // no more to add

      // find the next available block
      do {
        currentBlock++; // increment the block counter
        if(currentBlock >= groups[currentGroup].blocks) { // roll over to next group if necessary
          currentBlock = 0;
          currentGroup++;
  
          if(currentGroup >= groups.length) { // roll over to beginning if necessary
            currentGroup = 0;
          }
        }
      } while(data[currentGroup][currentBlock].length >= groups[currentGroup].codewords) // keep incrementing if current block is full
    }

    return data;
  }

  const dataCodewordBlocks = deinterleave(dataInterleaved, groupData.groups);
  // each error correction block has the same number of codewords (stored in groupData.ecCodewords)
  const ecGroupData = groupData.groups.map(g => ({
    blocks: g.blocks, 
    codewords: groupData.ecCodewords 
  }));

  const ecCodewordBlocks = deinterleave(ecInterleaved, ecGroupData);
  
  return {dataInterleaved, dataCodewordBlocks, ecInterleaved, ecCodewordBlocks}
}


/** Decodes the data codewords back to the original encoded message */
export function decodeData(codewords: number[]) {
  const encoding = (codewords[0] & 0b11110000) >> 4; // the top 4 bits of the first codeword is the encoding type

  if(encoding != 4)
    throw new Error("Encoding "+encoding.toString(2).padStart(4,"0")+" not supported");

  // the length is the bottom 4 bits of the first codeword, and the top 4 bits of the next
  const length = ((codewords[0] & 0b1111) << 4) | ((codewords[1] & 0b11110000) >> 4);

  // decode the next `length` bytes as UTF-8 characters
  let message = "";
  for(let i = 0; i < length; i++) {
    const topBits = (codewords[i+1] & 0xF) << 4;
    const bottomBits = (codewords[i+2] & 0xF0) >> 4;
    
    const char = String.fromCharCode(topBits | bottomBits);
    message += char;
  }

  return { encoding, length, message };
}
