<script lang="ts">
  import { maskFunctionStrings, versionFromSize, type Bit, type BitArray2D } from "$lib/qr/data";
  import { decodeData, deinterleaveBitstream, QRtextToBitArray, readQRCodewords, readQRMetadata } from "$lib/qr/decode";
  import { allPatterns, getPatternMask } from "$lib/qr/patterns";
  import QrOverlay from "$lib/qr/QROverlay.svelte";
  import { patternHues } from "$lib/qr/utils";
  import { toBinary, toHex } from "$lib/util";
  import Error from "../../+error.svelte";

  let qrText = "";
  $: qrError = "";
  $: isErrored = qrError.length > 0;
  
  // svelte reactivity is funky, easier to make the entire decoding process as a reactive function call
  const decode = (text: string) => {
    // reset error state (yeah i know this is stupid)
    qrError = "";

    if(!text || text.length == 0)
      return;

    // get text lines
    const lines = text.split("\n");
    
    // parse lines as bitarray of modules
    let QRBitArray: BitArray2D;
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
    const patternMasks = Object.fromEntries(
      allPatterns.map(pattern => [pattern, getPatternMask(qrSize, pattern)])
    );

    const overlays = allPatterns.map(
    pattern => ({
      bitarray: patternMasks[pattern],
      moduleOnColor: `hsl(${patternHues[pattern]}deg 100% 50% / 50%)`
    })
  );

    const {
      formatBitsTL,
      formatBitsBR,
      format,
      formatRaw,
      ecLevelNum,
      ecLevel,
      maskNum,
      maskFunc
    } = readQRMetadata(QRBitArray);

    const { bitstream } = readQRCodewords(QRBitArray, maskFunc);

    const {
      dataCodewordBlocks,
      ecCodewordBlocks
    } = deinterleaveBitstream(bitstream, version, ecLevel);

    const dataCodewords = dataCodewordBlocks.flat(3);

    let encoding: number;
    let length: number;
    let message: string;
    try {
      const tmp = decodeData(dataCodewords);
      encoding = tmp.encoding;
      length = tmp.length;
      message = tmp.message;
    } catch (error) {
      qrError = "Error decoding QR code: "+(error as Error).msg;
      return;
    }

    return {
      QRBitArray,
      qrSize,
      version,
      overlays,
      formatBitsTL,
      formatBitsBR,
      format,
      formatRaw,
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

</script>

<svelte:head>
  <title>Hackmud QR Reader| msteffens.dev</title>

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

            {#if isErrored}
              <article class="message is-danger">
                <div class="message-header">
                  <p>Error</p>
                  <p>{qrError}</p>
                </div>
                <div class="message-body">{qrError}</div>
              </article>
            {/if}
            {#if data}
              <QrOverlay QRBitArray={data.QRBitArray} width={data.qrSize} height={data.qrSize} overlays={data.overlays} />
            {/if}
        </div>

        <div class="column">
          {#if data && !isErrored}
            {@const {version, qrSize, formatBitsTL, formatBitsBR, format, formatRaw, ecLevel, ecLevelNum, maskNum} = data}
            <p>QR Version <code>{version}</code> [<code>{qrSize}</code>x<code>{qrSize}</code> modules]</p>
            <p>
              Top-Left format bits: <code>0b{formatBitsTL.join("")}</code><br>
              Bottom-Left format bits: <code>0b{formatBitsBR.join("")}</code><br>
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
                    <li>
                      Block {b}: {#each block as cw}<code>{toHex(cw)}</code>{" "}{/each}
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
    </div>
  </div>
</section>

{#if qrText.length > 0 && qrError.length == 0}
    <section class="section">
        <div class="container content">
            Confused? Check out my tutorial to <a href="/blog/decoding-qr-codes"
                >write your own QR code decoder</a
            >!
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
