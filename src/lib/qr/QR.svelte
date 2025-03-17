<script lang="ts">
    import { run } from "svelte/legacy";

    import { createEventDispatcher, onMount } from "svelte";
    import {
        getModule,
        getPatternMask,
        square2DArray,
        type BlockCharacter,
        type PatternName,
        defaultHues,
        allPatterns,
        type Bit,
        type QRReadHistory,
        type GroupColor,
    } from "./qrUtils";

    /// Inputs ///

    interface Props {
        /** QR code text string */
        qrText: string;
        /**
         * Select which patterns / sections of the QR code to visualize, optionally
         * with a custom hue. Special case for "block" pattern, which contains an
         * array of module coords and a hue
         *
         * ```
         * visualize = ["finder", "alignment"]
         * visualize = ["finder", ["version", 231]]
         * visualize = ["finder", ["block", [...], 74]]
         * ```
         */
        visualize?: ([PatternName, number] | PatternName | ["block", [number, number][], number])[];
        /** Whether or not to enable animation logic */
        animate?: boolean;
        animState?: "paused" | "play";
        animSpeed?: number;
        /** Module reading history */
        readHistory?: QRReadHistory[][] | null;
        /** Module size in pixels */
        moduleSize?: number;
    }

    let {
        qrText,
        visualize = $bindable([]),
        animate = false,
        animState = "paused",
        animSpeed = 1,
        readHistory = null,
        moduleSize = 8,
    }: Props = $props();

    const QRLines = qrText.trim().split("\n") as unknown as BlockCharacter[][]; // i love typescript
    const qrSize = QRLines[0].length;

    /// Visualization ///

    // assign each module to groups based on the pattern they belong to
    const patternGroup = $state(square2DArray<null | string>(qrSize, null));

    /** Module to highlight */
    let highlightedModule: [number, number] = $state([-1, -1]);

    /** Highlight color */
    let highlightedColor: string = $state("");

    for (const name of allPatterns) {
        const mask = getPatternMask(qrSize, name);

        for (let y = 0; y < qrSize; y++)
            for (let x = 0; x < qrSize; x++) if (mask[y][x] == 1) patternGroup[y][x] = name;
    }

    let customHue = $state(square2DArray<null | number>(qrSize, null));

    // (ab?)using reactivity to clear the hues array before processing the visualization
    run(() => {
        visualize && (customHue = square2DArray<null | number>(qrSize, null));
    });

    run(() => {
        visualize.forEach((opts) => {
            let name: PatternName | "block";
            let hue: number;
            let coords: [number, number][] = [];

            if (typeof opts == "string") {
                // default hue
                name = opts;
                hue = defaultHues[name];
            } else {
                if (opts[0] != "block") {
                    // custom hue
                    [name, hue] = opts;
                } else {
                    name = "block";
                    hue = opts[2];
                    coords = opts[1];
                }
            }

            if (name == "block") {
                for (const [x, y] of coords) customHue[y][x] = hue;
            } else {
                // set custom patterns for the pattern mask
                const mask = getPatternMask(qrSize, name);
                for (let i = 0; i < qrSize; i++)
                    for (let j = 0; j < qrSize; j++) {
                        customHue[i][j] = mask[i][j] == 1 ? hue : customHue[i][j];
                    }
            }
        });
    });

    const offLightness = 72;
    const onLightness = 100 - offLightness;
    const generateColor = (hue: number | null, on: Bit) =>
        hue ? `hsl(${hue} 100 ${on ? onLightness : offLightness})` : "";

    /// Animation ///

    let readTickDelay = $derived(250 / animSpeed);
    let skipTickDelay = $derived(85 / animSpeed);

    /** Hue of the data codeword currently being read */
    const activeHue = 44;
    /** Hue of the other data codewords */
    const passiveHue = 264;

    const moduleReadColor = "#04fc00";
    const moduleSkippedColor = "#00fce3";

    /** base visualization is all the patterns in red hue, to signify the skipmask */
    const baseVisualization: ([PatternName, number] | ["block", [number, number][], number])[] =
        allPatterns.map((pattern) => [pattern, 3]);

    let currentHistoryIndex = 0;
    let currentBit = 0;
    let bitString = "";

    export const resetAnim = () => {
        currentBit = 0;
        currentHistoryIndex = 0;
        bitString = "";

        const newVisualization = [...baseVisualization]; // shallow copy, i know. but i'm not modifying the children, so it should be fine

        if (readHistory)
            for (const hist of readHistory) {
                const moduleGroup = hist
                    .filter((hist) => hist[2] == "read")
                    .map(([x, y]) => [x, y]) as [number, number][];

                newVisualization.push(["block", moduleGroup, passiveHue]);
            }

        visualize = newVisualization;
        dispatcher("bitUpdate", { bitString });
    };

    // animation stuff shouldn't be prerendered
    onMount(() => {
        let then = document.timeline.currentTime as number;

        let t = 0;
        let tickDelay = readTickDelay;

        const animLoop = (now: number) => {
            const delta = now - then;
            then = now;

            if (animState == "play") t += delta;

            if (t > tickDelay) {
                t = 0;

                if (!readHistory) return requestAnimationFrame(animLoop);

                const oldHistory = readHistory[currentHistoryIndex];

                // roll over the current bit and current history reading block
                currentBit++;
                if (currentBit >= oldHistory?.length) {
                    currentBit = 0;

                    currentHistoryIndex++;
                    if (currentHistoryIndex >= readHistory.length) {
                        currentHistoryIndex = 0;
                        bitString = "";
                    }
                }

                const currentHistory = readHistory[currentHistoryIndex];
                const [x, y, state] = currentHistory[currentBit];

                if (state == "read") {
                    bitString += getModule(x, y, QRLines);
                    dispatcher("bitUpdate", { bitString });
                }

                const newVisualization = [...baseVisualization];

                // iterate over all the history and add blocks to the visualization
                for (const hist of readHistory) {
                    const moduleGroup = hist
                        .filter(([x, y, state]) => state == "read")
                        .map(([x, y]) => [x, y]) as [number, number][];

                    const hue = hist == currentHistory ? activeHue : passiveHue;

                    newVisualization.push(["block", moduleGroup, hue]);
                }

                visualize = newVisualization;
                highlightedModule = [x, y];
                highlightedColor = state == "read" ? moduleReadColor : moduleSkippedColor;

                tickDelay = state == "read" ? readTickDelay : skipTickDelay;
            }

            requestAnimationFrame(animLoop);
        };

        if (animate) {
            resetAnim();
            requestAnimationFrame(animLoop);
        }
    });

    /** Event dispatcher */
    const dispatcher = createEventDispatcher();
</script>

<div
    class="qr-container"
    style:width={`${qrSize * moduleSize}px`}
    style:height={`${qrSize * moduleSize}px`}
>
    <div class="qr">
        {#each QRLines[0] as _, y}
            {#each QRLines[0] as _, x}
                <div
                    class="module"
                    style:width={`${moduleSize}px`}
                    style:height={`${moduleSize}px`}
                    class:on={getModule(x, y, QRLines)}
                    style:background-color={generateColor(
                        customHue[y][x],
                        getModule(x, y, QRLines)
                    )}
                    data-group={patternGroup[y][x]}
                    class:highlight={highlightedModule[0] == x && highlightedModule[1] == y}
                    style:border-width={highlightedModule[0] == x && highlightedModule[1] == y
                        ? "2px"
                        : ""}
                    style:border-color={highlightedModule[0] == x && highlightedModule[1] == y
                        ? `${highlightedColor}`
                        : ""}
                    style:box-shadow={highlightedModule[0] == x && highlightedModule[1] == y
                        ? `0 0 15px 0 ${highlightedColor}`
                        : ""}
                    onmouseenter={(ev) => dispatcher("moduleenter", { module: ev.currentTarget })}
                    onmouseleave={(ev) => dispatcher("moduleleave", { module: ev.currentTarget })}
                    role="none"
                ></div>
            {/each}
        {/each}
    </div>
</div>

<style lang="sass">
    $off: #fff
    $on: #000

    .qr-container
        display: block
        box-sizing: content-box
        margin: 1rem 0
        padding: 1rem
        background-color: $off
    
    .qr
        display: flex
        flex-direction: row
        flex-wrap: wrap
        width: 100%
        height: 100%

        .module
            display: inline-block
            margin: 0
            padding: 0
            background-color: $off
            box-sizing: border-box
            transition: border-width 750ms ease-out, border-color 750ms ease-out
            border: solid 0px transparent

            &.on
                background-color: $on

            &.highlight
                transition: border-width 0s, border-color 0s

</style>
