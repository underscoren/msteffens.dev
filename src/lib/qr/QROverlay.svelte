<!-- Basic QR code -->
<script lang="ts">
  import type { BitArray2D, BitMaybeArray2D } from "./data";
  import QRSimple from "./QRSimple.svelte";


    /** Width in modules */
    export let width: number
    /** Height in modules */
    export let height: number
    /** Base QR code */
    export let QRBitArray: BitMaybeArray2D

    /** [x,y] coordinate of highlighted module */
    export let highlighted: [number, number] | undefined = undefined;

    export let highlightedColor: string | undefined = undefined;

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
    }[] = [];

    /** Size of modules in pixels */
    export let moduleSizePx: number = 10;

</script>

<div 
  class="qr-overlay-container"
  style:--widthModules={width}
  style:--heightModules={height}
  style:--moduleSize={moduleSizePx+"px"}
>
  <QRSimple {width} {height} {QRBitArray} {moduleSizePx} style={"position: absolute; top: 0; left: 0"}/>
  {#each overlays as {bitarray, bgColor = "transparent", moduleOnColor = "rgba(255, 0, 0, 0.5)", moduleOffColor = "transparent", visible = true}, i}
    {@const isLast = i == (overlays.length-1)}
    <QRSimple
      {width} 
      {height} 
      QRBitArray={bitarray} 
      {moduleSizePx} 
      {bgColor} 
      moduleOnColor={visible ? moduleOnColor : "transparent"}
      {moduleOffColor} 
      style={`position: absolute; top: 0; left: 0; z-index: ${i};`}
      highlighted={isLast ? highlighted : undefined} 
      highlightedColor={isLast ? highlightedColor : undefined}
    />
  {/each}
</div>

<style lang="sass">
.qr-overlay-container
  position: relative
  padding: 0
  margin-bottom: 2rem
  width: calc(2rem + var(--widthModules) * var(--moduleSize))
  height: calc(2rem + var(--heightModules) * var(--moduleSize))

</style>