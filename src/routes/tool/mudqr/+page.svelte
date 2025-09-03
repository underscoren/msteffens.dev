<script lang="ts">
    import { page } from "$app/stores";
  import { maskFunctionStrings, versionFromSize, type Bit, type BitArray2D, type BitMaybeArray2D } from "$lib/qr/data";
  import { decodeData, deinterleaveBitstream, QRtextToBitArray, readQRCodewords, readQRMetadata } from "$lib/qr/decode";
    import { calcSyndromes, correctErrata } from "$lib/qr/errorCorrection";
  import { allPatterns, getPatternMask } from "$lib/qr/patterns";
  import QrOverlay from "$lib/qr/QROverlay.svelte";
  import { patternHues } from "$lib/qr/utils";
  import { toBinary, toHex } from "$lib/util";
    import { onMount } from "svelte";
  import Error from "../../+error.svelte";
  import { Base64 } from "js-base64";

  let qrText = "";
  $: qrError = "";
  $: isErrored = qrError.length > 0;

  const alphabet = " ▀▄█\n¡¢Á¤Ã¦§¨©ª";

  /** Compresses the QR textbox text, encoded as url-safe base64 */
  const compressQR = (qrText: string) => {
    const textchars = new Set(qrText);
    const alphabetSet = new Set(alphabet);
    
    // check if there are any characters in the text not in the alphabet
    if(!alphabetSet.isSupersetOf(textchars))
      return "";

    const toNum = (char: string) => alphabet.indexOf(char);
    const charNums = qrText.split("").map(toNum);
    
    // pack to uint8array
    const dataByteCount = Math.ceil(charNums.length / 2);
    const charBytes = new Uint8Array(2 + dataByteCount);

    // write length as 16-bit int
    charBytes[0] = charNums.length & 0xFF;
    charBytes[1] = (charNums.length >> 8) & 0xFF;

    // pack the values starting at byte 2
    for (let i = 0; i < charNums.length; i += 2) {
      const byteIndex = 2 + Math.floor(i / 2);
      const highNibble = charNums[i] << 4; // shift to upper 4 bits
      const lowNibble = i + 1 < charNums.length ? charNums[i + 1] : 0; // lower 4 bits (0 if odd length)
      
      charBytes[byteIndex] = highNibble | lowNibble;
    }

    // to base64 (url-safe)
    const b64 = Base64.fromUint8Array(charBytes, true);
    return b64;
  }

  /** Decompresses base64-encoded packed qr text */
  const decompressQR = (b64: string) => {
    const packedBytes = Base64.toUint8Array(b64);
    
    // unpack text

    const length = packedBytes[0] | (packedBytes[1] << 8);

    const expectedDataBytes = Math.ceil(length / 2);
    const expectedTotalBytes = 2 + expectedDataBytes;
    
    // sanity check
    if (packedBytes.length < expectedTotalBytes)
      throw new Error(`packed array too short: expected ${expectedTotalBytes} bytes, got ${packed.length}`);
    

    let unpacked: number[] = [];

    // Unpack the data bytes starting from index 2
    for (let i = 2; i < 2 + expectedDataBytes; i++) {
      const byte = packedBytes[i];
      const highValue = (byte & 0xF0) >> 4; // upper 4 bits
      const lowValue = byte & 0x0F;         // lower 4 bits

      unpacked.push(highValue);
      
      // only add the second value if we haven't reached the original length
      if (unpacked.length < length)
        unpacked.push(lowValue);
      
    }

    unpacked = unpacked.slice(0, length);

    // convert to text using alphabet
    const text = unpacked.map(num => alphabet[num]).join("");

    return text;
  }


  /** Converts a string of 0, 1, or ? to a hex byte, or ?? if unknown bits contained */
  const toMaybeHex = (bitstring: string) => bitstring.indexOf("?") >= 0 ? "??" : toHex(parseInt(bitstring, 2));
  
  // svelte reactivity is funky, easier to make the entire decoding process as a reactive function call
  const decode = (text: string) => {
    // reset error state (yeah i know this is stupid)
    qrError = "";
    
    if(!text || text.length == 0)
      return;
    
    // get text lines
    const lines = text.split("\n");
    
    // parse lines as bitarray of modules
    let QRBitArray: BitMaybeArray2D;
    try {
      QRBitArray = QRtextToBitArray(lines);
    } catch (error) {
      console.error(error);
      qrError = "Unable to parse QR text. Did you paste it correctly?";
      return;
    }
    
    // calculate size and version
    const qrSize = QRBitArray.length;
    const version = versionFromSize(qrSize);
    
    // compute all overlay masks
    const overlays = allPatterns.map(
    pattern => ({
      bitarray: getPatternMask(qrSize, pattern),
      moduleOnColor: `hsl(${patternHues[pattern]}deg 100% 50% / 50%)`
    })
    );
    
    const {
      formatBitsTL,
      formatBitsBR,
      format,
      formatBits,
      formatRaw,
      ecLevelNum,
      ecLevel,
      maskNum,
      maskFunc
    } = readQRMetadata(QRBitArray);
    console.log("read meta")
    
    const { bitstream } = readQRCodewords(QRBitArray, maskFunc);
    
    console.log("read bitstream")

    const {
      dataCodewordBlocks,
      ecCodewordBlocks
    } = deinterleaveBitstream(bitstream, version, ecLevel);
    
    console.log("deinterleaved")
    console.log(dataCodewordBlocks)
    console.log(ecCodewordBlocks)

    let dataCodewords: number[];

    // perform error correction if necessary
    if(dataCodewordBlocks.flat(3).find(str => str.indexOf("?") >= 0)) {
      console.log("data corrupt")
      // there are errors present, correction required

      const corrected = dataCodewordBlocks.map((group, g) => 
        group.map((block, b) => {
          // for each block in each group

          // convert bitstrings to numbers, keeping track of error positions
          const errorPositions: number[] = [];
          const bestGuessCodeword = (bitstring: string, index: number) => {
            // replace all unknown bits with 0
            const corrected = bitstring.replaceAll("?", "0");
            
            // if corrected bitstring is different, there were errors
            if(corrected != bitstring)
              errorPositions.push(index);

            return parseInt(corrected, 2);
          }

          // combine data and error correction codewords to form the RS message
          const ecBlock = ecCodewordBlocks[g][b];
          const message = [...block, ...ecBlock].map(bestGuessCodeword);
          
          const numEcCodewords = ecBlock.length;
          // calculate syndromes (the number of syndrome codewords is the number of ec codewords)
          const syndromes = calcSyndromes(message, numEcCodewords);

          // if syndromes are all 0 then no errors are present
          if(syndromes.filter(s => s != 0).length == 0)
            return message.slice(0, block.length);

          // otherwise, find the error magnitudes and apply corrections to the message
          const correctedMessage = correctErrata(message, syndromes, errorPositions)

          return correctedMessage.slice(0, block.length);
        })
      );

      dataCodewords = corrected.flat(3);
    } else {
      dataCodewords = dataCodewordBlocks.flat(3).map(bitstring => parseInt(bitstring, 2));
    }
    console.log("codewords",dataCodewords);
    
    let encoding: number;
    let length: number;
    let message: string;
    try {
      const tmp = decodeData(dataCodewords);
      encoding = tmp.encoding;
      length = tmp.length;
      message = tmp.message;
    } catch (error) {
      console.error(error);
      qrError = "Error decoding QR code: "+(error as Error).msg;
      return;
    }

    console.log("decode success: "+message);

    // compress qr text and set the page hash
    const base64QR = compressQR(text);
    window.location.hash = base64QR;
    
    return {
      QRBitArray,
      qrSize,
      version,
      overlays,
      formatBitsTL,
      formatBitsBR,
      formatBits,
      formatRaw,
      format,
      ecLevelNum,
      ecLevel,
      maskNum,
      dataCodewordBlocks,
      dataCodewords,
      ecCodewordBlocks,
      encoding,
      length,
      message
    }
  }
  
  $: data = decode(qrText);

  // load QR code from hash on page load
  onMount(() => {
    if(window.location.hash.length == 0)
      return;

    const qrTextFromHash = decompressQR(window.location.hash.slice(1));
    if(qrTextFromHash)
      qrText = qrTextFromHash;
  });
  
</script>

<svelte:head>
<title>Hackmud QR Reader | msteffens.dev</title>

<meta
name="description"
content="A hackmud-style text-encoded QR decoder showing advanced debug information"
/>

<meta property="og:title" content="Hackmud QR Reader" />
<meta
property="og:description"
content="A hackmud-style text-encoded QR decoder showing advanced debug information"
/>
<meta property="og:author" content="_n" />

<meta property="og:img" content={`https://msteffens.dev/img/qr/hm_qr.png`} />
<meta property="og:url" content={`https://msteffens.dev/tool/mudqr`} />

<meta name="twitter:card" content="summary" />
</svelte:head>

<section class="section">
  <div class="container content">
    <h1 class="title is-text-monospace">Hackmud QR Reader</h1>
    
    <div class="columns">
      <div class="column">
        <textarea
          bind:value={qrText}
          class="qrinput is-text-monospace"
          placeholder="Paste your QR code text here..."
        ></textarea>
      </div>
      <div class="column">
        {#if data}
        <QrOverlay moduleSizePx={8} QRBitArray={data.QRBitArray} width={data.qrSize} height={data.qrSize} overlays={data.overlays} />
        {/if}
      </div>
    </div>
      
    {#if isErrored}
    <article class="message is-danger">
      <div class="message-header">
        <p>Error</p>
        <p>{qrError}</p>
      </div>
      <div class="message-body">{qrError}</div>
    </article>
    {/if}
      
    {#if data && !isErrored}
    {@const {version, qrSize, formatBitsTL, formatBitsBR, formatBits, format, formatRaw, ecLevel, ecLevelNum, maskNum} = data}
    {@const formatCombined = formatBitsTL.map((bit, i) =>
      bit == "?" ? formatBitsBR[i] : bit
    )}
    
    <p>QR Version <code>{version}</code> [<code>{qrSize}</code>x<code>{qrSize}</code> modules]</p>
    
    <p>
      Top-Left format bits: <code>0b{formatBitsTL.join("")}</code><br>
      Bottom-Left format bits: <code>0b{formatBitsBR.join("")}</code><br>
      {#if formatCombined.indexOf("?") >= 0}
      Format combined: <code>{formatCombined.join("")}</code><br>
      {/if}
      Format: <code>0b{toBinary(format, 5)}</code> (Masked: <code>{toBinary(formatRaw, 5)}</code>)<br>
      Error Correction Level: <code>{ecLevel}</code> <code>0b{toBinary(ecLevelNum, 2)} = {ecLevelNum}</code><br>
      Mask: <code>{maskNum}</code> <code>0b{toBinary(maskNum, 3)} = {maskNum}</code><br>
      Formula: <code>{maskFunctionStrings[maskNum]}</code>
    </p>
    
    <p>Interleaved data:</p>
    
    {@const {dataCodewordBlocks, ecCodewordBlocks, dataCodewords} = data}
    {#each [{kind: "Data", codewords: dataCodewordBlocks}, {kind: "Error Correction", codewords: ecCodewordBlocks}] as {kind, codewords}}
    <p>{kind} Codewords:</p>
    
    <ul>
      {#each codewords as group, g}
      <li>Group {g} [{group.length} blocks / {group[0].length} codewords per block]
        <ul>
          {#each group as block, b}
          {@const totalCodewordsCorrupt = block.filter(bitstring => bitstring.indexOf("?") >= 0).length}
          <li>
            Block {b}
            {#if totalCodewordsCorrupt > 0}
              {" "}[{totalCodewordsCorrupt} corrupt]
            {/if}:<br>
            {#each block as cw}<code>{toMaybeHex(cw)}</code>{" "}{/each}
          </li>
          {/each}
        </ul>
      </li>
      {/each}
    </ul>
    {/each}
    
    <p>
      Deinterleaved data:<br>
      {#each dataCodewords as cw}<code>{toHex(cw)}</code>{" "}{/each}
    </p>
    
    {@const {encoding, length, message} = data}
    <p>
      Encoding: "Bytes" <code>0b{toBinary(encoding, 4)} = {encoding}</code><br>
      Length: {length} bytes <code>0b{toBinary(length, 8)}</code>
    </p>
    
    <p>
      Decoded data:<br>
      <code>{message}</code>
    </p>
    {/if}
  </div>
</section>

{#if qrText.length > 0 && qrError.length == 0}
<section class="section">
  <div class="container content">
    Confused? Check out my tutorial to <a href="/blog/decoding-qr-codes">write your own QR code decoder</a>!
  </div>
</section>
{/if}

<style lang="sass">
.qrinput
  width: 21rem
  height: 21rem
  background-color: rgba(255, 255, 255, 0.1)
  color: #fff
  margin-bottom: 1rem
  font-size: 0.66rem
</style>
