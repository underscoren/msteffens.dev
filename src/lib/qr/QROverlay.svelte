<!-- Basic QR code -->
<script lang="ts">
  import type { BitArray2D } from "./data";
  import QRSimple from "./QRSimple.svelte";

  interface Props {
    /** Width in modules */
    width: number
    /** Height in modules */
    height: number
    /** Base QR code */
    QRBitArray: BitArray2D

    /** Overlay QR codes */
    overlays: {
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

    /** Size of modules in pixels */
    moduleSizePx?: number

    // module hover handlers

    onModuleEnter?: (x: number, y: number) => any
    onModuleLeave?: (x: number, y: number) => any
  }

  let {
    width,
    height,
    QRBitArray,
    moduleSizePx = 10,
    onModuleEnter,
    onModuleLeave,
    overlays
  }: Props = $props();

</script>

<div 
  class="qr-overlay-container"
  style:--widthModules={width}
  style:--heightModules={height}
  style:--moduleSize={moduleSizePx+"px"}
>
  <QRSimple {width} {height} {QRBitArray} {moduleSizePx} style={"position: absolute; top: 0; left: 0"}/>
  {#each overlays as {bitarray, bgColor = "transparent", moduleOnColor = "rgba(255, 0, 0, 0.5)", moduleOffColor = "transparent", visible}, i}
    <QRSimple
      {width} 
      {height} 
      QRBitArray={bitarray} 
      {moduleSizePx} 
      {bgColor} 
      moduleOnColor={visible ? moduleOnColor : "transparent"}
      {moduleOffColor} 
      style={`position: absolute; top: 0; left: 0; z-index: ${i};`} 
      onModuleEnter={i == (overlays.length-1) ? onModuleEnter : undefined}
      onModuleLeave={i == (overlays.length-1) ? onModuleLeave : undefined}
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