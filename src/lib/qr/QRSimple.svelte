<!-- Basic QR code -->
<script lang="ts">
  import type { BitArray2D } from "./data";

  interface Props {
    /** Width in modules */
    width: number
    /** Height in modules */
    height: number
    /** 2D Array for each module in the QR code*/
    QRBitArray: BitArray2D
    
    /** Size of modules in pixels */
    moduleSizePx?: number
    
    /** Background color */
    bgColor?: string
    /** Module on color */
    moduleOnColor?: string
    /** Module off color */
    moduleOffColor?: string

    /** Style override */
    style?: string

    // module hover handlers

    onModuleEnter?: (x: number, y: number) => any
    onModuleLeave?: (x: number, y: number) => any
  }

  const props: Props = $props();

  const {
    width,
    height,
    QRBitArray,
    moduleSizePx = 10,
    moduleOnColor = "#000",
    moduleOffColor = "#fff",
    bgColor = "#fff",
    onModuleEnter,
    onModuleLeave,
  } = props;

</script>

<div
  class="qr-container"
  style:--widthModules={width}
  style:--heightModules={height}
  style:--moduleSize={moduleSizePx+"px"}
  style:--bgColor={bgColor}
  style:--moduleOnColor={moduleOnColor}
  style:--moduleOffColor={moduleOffColor}
  style={props.style}
>
  <div class="qr">
    {#each QRBitArray as line, y}
      {#each line as bit, x}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="module"
          class:on={bit == 1}
          onmouseenter={() => onModuleEnter?.(x,y)}
          onmouseleave={() => onModuleLeave?.(x,y)}
        ></div>
      {/each}
    {/each}
  </div>
</div>

<style lang="sass">
.qr-container
  display: block
  box-sizing: content-box
  margin: 1rem 0
  padding: 1rem
  background-color: var(--bgColor)
  width: calc(var(--widthModules) * var(--moduleSize))
  height: calc(var(--heightModules) * var(--moduleSize))

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
    background-color: var(--moduleOffColor)
    width: var(--moduleSize)
    height: var(--moduleSize)

    &.on
      background-color: var(--moduleOnColor)
</style>