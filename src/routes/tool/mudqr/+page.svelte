<script lang="ts">
    import QR from "$lib/qr/QR.svelte";
    import {
        allPatterns,
        codewordGroups,
        combineMask,
        getModule,
        getPatternMask,
        maskFormulae,
        type BlockCharacter,
    } from "$lib/qr/qrUtils";
    import { toByte } from "$lib/util";

    let qrText: string | undefined = $state();

    // sanity checks

    /** Returns the unique characters in the string */
    const uniqueChars = (text: string) => [...new Set(text.split(""))];

    /** Very terrible way of checking for array equality */
    const arraySimilarShallow = (a: string[], b: string[]) =>
        a.length == b.length && a.reduce((state, element) => state && b.includes(element), true);

    /** removes all elements of b that are in a */
    const filterExisting = <T,>(a: T[], b: T[]) => a.filter((el) => !b.includes(el));

    const blockChars = [" ", "▀", "▄", "█"];
    const allowedChars = [...blockChars, "\n"];

    const validateQR = (text: string) => {
        if (text.length > 0) {
            const qrChars = uniqueChars(text);
            console.log(qrChars);

            if (!arraySimilarShallow(allowedChars, qrChars))
                return `Invalid Characters: ${filterExisting(qrChars, blockChars).join(" ")}\nSorry, no support for error correction yet`;
        }
    };

    let qrError: string | undefined = $derived(qrText ? validateQR(qrText.trim()) : undefined);

    /// stats and debug

    type QRData = {
        size: number
        version: number
        format: number
        ecLevel: number
        mask: number
        groups: [number, number][]
        maskFormula: (x: number, y: number) => boolean
        interleavedBlocks: string[]
        dataBlocks: string[][][]
        encodedData: string
        encoding: number
        length: number
        decoded: string
    }

    /** Decode QR Code */
    const decode = (text: string): QRData => {
        const qrLines = text.trim().split("\n") as unknown as BlockCharacter[][];
        const size = qrLines[0].length;

        const skipMask = allPatterns
            .map((name) => getPatternMask(size, name))
            .reduce((a, b) => combineMask(a, b));

        const version = (size - 21) / 4 + 1;

        const formatBits = [];

        for (let x = 0; x < 5; x++) formatBits.push(getModule(x, 8, qrLines));

        const format = parseInt(formatBits.join(""), 2) ^ 0b10101;

        const ecLevel = format >> 3;
        const mask = format & 0b111;

        const ecIndex = [1, 0, 3, 2][ecLevel];
        const groups = codewordGroups[version]?.[ecIndex];

        const totalDataCodewords = groups.reduce(
            (sum, [blocks, codewords]) => sum + blocks * codewords,
            0
        );

        const maskFormula = maskFormulae[mask];

        let direction: 1 | -1 = -1;

        const readBit = (x: number, y: number) => {
            const bit = getModule(x, y, qrLines) ^ Number(maskFormula(x, y));

            do {
                if (x & 1) {
                    x++;
                    y += direction;
                } else {
                    x--;
                }

                if (y < 0 || y == size) {
                    y -= direction;
                    direction *= -1;
                    x -= 2;
                }

                if (x < 0) break;
            } while (skipMask[y][x] == 1);

            return [bit, x, y] as [number, number, number];
        };

        const readBits = (x: number, y: number, n: number) => {
            const bits = [];

            while (n-- > 0) {
                let bit;
                [bit, x, y] = readBit(x, y);

                bits.push(bit);
            }

            return [bits.join(""), x, y] as [string, number, number];
        };

        const interleavedBlocks = [];

        let i = totalDataCodewords;
        let currentX = size - 1;
        let currentY = size - 1;

        while (i-- > 0) {
            let bits;
            [bits, currentX, currentY] = readBits(currentX, currentY, 8);

            interleavedBlocks.push(bits);
        }

        // deinterleaving

        let currentGroup = 0;
        let currentBlock = 0;

        const dataBlocks = groups.map(([blocks]) =>
            Array.from({ length: blocks }, () => new Array())
        ) as string[][][];

        for (let i = 0; i < interleavedBlocks.length; i++) {
            dataBlocks[currentGroup][currentBlock].push(interleavedBlocks[i]);

            const [blocksInGroup] = groups[currentGroup];

            do {
                if (i == interleavedBlocks.length - 1) break; // avoid an infinite loop at the end

                currentBlock += 1;

                if (currentBlock >= blocksInGroup) {
                    currentBlock = 0;
                    currentGroup += 1;

                    if (currentGroup >= groups.length) {
                        currentGroup = 0;
                    }
                }
            } while (dataBlocks[currentGroup][currentBlock].length >= groups[currentGroup][1]);
        }

        const encodedData = dataBlocks.flat(3).join("");

        const encoding = parseInt(encodedData.slice(0, 4), 2);
        const length = parseInt(encodedData.slice(4, 12), 2);

        let decoded: string;

        if (encoding != 4)
            throw "Encoding " + encoding.toString(2).padStart(4, "0") + " not supported";
        else
            decoded = [...encodedData.slice(12, 12 + length * 8).matchAll(/.{1,8}/g)]
                .map((bits) => parseInt(bits as unknown as string, 2))
                .map((num) => String.fromCharCode(num))
                .join("");

        return {
            size,
            version,
            format,
            ecLevel,
            mask,
            groups,
            maskFormula,
            interleavedBlocks,
            dataBlocks,
            encodedData,
            encoding,
            length,
            decoded,
        };
    };

    let qr: QRData | undefined = $derived(qrText ? decode(qrText) : undefined)
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

<section class="section" style="height: 100%">
    <div class="container content">
        <h1 class="title is-text-monospace">Hackmud QR Reader</h1>

        <div class="columns">
            <div class="column">
                <textarea
                    bind:value={qrText}
                    class="qrinput is-text-monospace"
                    placeholder="Paste your (clean) QR code here..."
                ></textarea>

                {#if qrError}
                    <article class="message is-danger">
                        <div class="message-header">
                            <p>Parsing Error</p>
                        </div>
                        <div class="message-body">{qrError}</div>
                    </article>
                {/if}

                {#if qrText && !qrError}
                    <QR {qrText} visualize={allPatterns} />
                {/if}
            </div>

            <div class="column">
                {#if qr && !qrError}
                    <p>QR Version {qr.version} [{qr.size}x{qr.size} modules]</p>
                    <p>
                        Format bits: <code>{qr.format.toString(2).padStart(5, "0")}</code> (Masked /
                        Raw: <code>{(qr.format ^ 0b10101).toString(2).padStart(5, "0")}</code>)<br />
                        Error Correction Level: {qr.ecLevel}
                        <code>{qr.ecLevel.toString(2).padStart(2, "0")}</code>
                        - {["M", "L", "H", "Q"][qr.ecLevel]}<br />
                        Mask: {qr.mask} <code>{qr.mask.toString(2).padStart(3, "0")}</code> Formula: {maskFormulae[
                            qr.mask
                        ].toString()}<br />
                    </p>

                    <p>Interleaved data:</p>

                    Groups:
                    <ul style="margin-top: 0.25rem">
                        {#each qr.dataBlocks as group, g}
                            <li>
                                Group {g} [{qr.groups[g][0]} blocks / {qr.groups[g][1]} codewords per block]
                                <ul>
                                    {#each group as block, b}
                                        <li>
                                            Block {b}: {#each block as cw}<code>{toByte(cw)}</code
                                                >{/each}
                                        </li>
                                    {/each}
                                </ul>
                            </li>
                        {/each}
                    </ul>

                    <p>
                        Encoded (Deinterleaved) data:<br />
                        {#each [...qr.encodedData.matchAll(/.{1,8}/g)] as cw}
                            <code>{toByte(`${cw}`)}</code>&#8203;
                        {/each}
                    </p>

                    <p>
                        Encoding: {qr.encoding} <code>0b{qr.encoding.toString(2).padStart(4, "0")}</code>
                        <code>0x{qr.encoding.toString(16).padStart(2, "0")}</code>
                        - Bytes<br />
                        Length: {qr.length} bytes <code>0b{qr.length.toString(2).padStart(8, "0")}</code>
                        <code>0x{qr.length.toString(16).padStart(2, "0")}</code>
                    </p>

                    <p>
                        Decoded data:<br />
                        <code>{qr.decoded}</code>
                    </p>
                {/if}
            </div>
        </div>
    </div>
</section>

{#if !qrError}
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
