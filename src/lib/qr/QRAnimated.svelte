<!-- Animated QR code to display an animation of reading -->
<script lang="ts">
  import { onMount } from "svelte";
  import { type BitArray2D } from "./data";
  import type { QRReadHistory } from "./decode";
  import QrOverlay from "./QROverlay.svelte";
  import { square2DArray } from "./utils";
    import { read } from "$app/server";

  
  /** Width in modules */
  export let width: number;
  /** Height in modules */
  export let height: number;
  /** Base QR code */
  export let QRBitArray: BitArray2D;

  /** Overlay QR codes */
  export let overlays: {
      /** QR code modules */
      bitarray: BitArray2D

      /** Background color */
      bgColor?: string
      /** Module on color */
      moduleOnColor?: string
      /** Module off color */
      moduleOffColor?: string
      /** is visible */
      visible?: boolean
    }[]

  /** History of read modules */
  export let readHistory: (QRReadHistory & {codeword: number})[];

  /** Size of modules in pixels */
  export let moduleSizePx: number = 10;

  $: currentIndex = 0;
  $: currentCodeword = readHistory[currentIndex].codeword;
  $: highlighted = [readHistory[currentIndex].x, readHistory[currentIndex].y] as [number, number]
  $: highlightedColor = readHistory[currentIndex].operation == "read" ? "#ff8800" : "#00ccff"

  const dataMask = square2DArray(width, 0) as BitArray2D;
  readHistory
    .filter(({operation}) => operation == "read")
    .forEach(({x, y}) => {
      dataMask[y][x] = 1;
    });
  
  $: currentGroupModules = readHistory.filter(({codeword}) => codeword == currentCodeword);
  $: codewordMask = (() => {
    const mask = square2DArray(width, 0);
    for(const {x,y} of currentGroupModules)
      mask[y][x] = 1;
    
    return mask as BitArray2D;
  })();

  const animationFrameTime = 100 // msec per "frame"
  $: animationSpeedMult = 1; // speed multiplier
  
  $: animationSpeed = animationFrameTime / animationSpeedMult;
  $: animationPlaying = false;

  // animation loop
  onMount(() => {
    let lastTimestamp = 0;
    let elapsedTotal = 0;
    
    const animateFrame = (now: DOMHighResTimeStamp) => {
      const delta = now - lastTimestamp;
      lastTimestamp = now;
      
      if (animationPlaying)
        elapsedTotal += delta;
      
      if(elapsedTotal < animationSpeed)
        return requestAnimationFrame(animateFrame);

      elapsedTotal = 0;
      currentIndex = (currentIndex + 1) % readHistory.length; 

      requestAnimationFrame(animateFrame);
    }

    requestAnimationFrame(animateFrame);
  })

</script>

<QrOverlay {width} {height} {QRBitArray} {moduleSizePx} {highlighted} {highlightedColor} overlays={[...overlays, {bitarray: dataMask, moduleOnColor: "rgba(166, 171, 70, 0.5)"}, {bitarray: codewordMask, moduleOnColor: "rgba(191, 0, 179, 0.5)"}]} />

<div class="qr-anim-controls">
  <div class="anim-speed-container">
    <input min={0.5} max={5} step={0.01} class="input" type="range" bind:value={animationSpeedMult} >
    <span>Speed</span>
  </div>
  <button
    on:click={() => animationPlaying = !animationPlaying} 
    class="button"
    class:is-primary={!animationPlaying}
    class:is-danger={animationPlaying}
  >{animationPlaying ? "Stop" : "Play"}</button>
  <button on:click={() => currentIndex = 0} class="button is-info">Reset</button>
</div>

<style lang="sass">
.anim-speed-container
  display: flex
  align-items: stretch
  justify-items: baseline
  margin-bottom: 0.75rem

  span
    margin-left: 0.5rem
</style>