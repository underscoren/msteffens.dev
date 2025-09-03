<!-- Basic QR code -->
<script lang="ts">
  import type { BitMaybeArray2D } from "./data";

  
    /** Width in modules */
    export let width: number
    /** Height in modules */
    export let height: number
    /** 2D Array for each module in the QR code*/
    export let QRBitArray: BitMaybeArray2D
    
    /** Size of modules in pixels */
    export let moduleSizePx = 10;
    
    /** Background color */
    export let bgColor = "#fff";
    /** Module on color */
    export let moduleOnColor = "#000";
    /** Module off color */
    export let moduleOffColor = "#fff";

    /** Style override */
    export let style: string | undefined = undefined;

    /** Module which is currently highlighted */
    export let highlighted: [number, number] | undefined = undefined;

    export let highlightedColor: string = "#ff8800";

    // module hover handlers

    export let onModuleEnter: ((x: number, y: number) => any) | undefined = undefined;
    export let onModuleLeave: ((x: number, y: number) => any) | undefined = undefined;

</script>

<div
  class="qr-container"
  style:--widthModules={width}
  style:--heightModules={height}
  style:--moduleSize={moduleSizePx+"px"}
  style:--bgColor={bgColor}
  style:--moduleOnColor={moduleOnColor}
  style:--moduleOffColor={moduleOffColor}
  style={style}
>
  <div class="qr">
    {#each QRBitArray as line, y}
      {#each line as bit, x}
        {@const isHighlighted = highlighted ? highlighted[0] == x && highlighted[1] == y : false}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="module"
          class:on={bit == 1}
          class:unknown={bit == "?"}
          class:highlighted={isHighlighted}
          style:--highlightColor={isHighlighted ? highlightedColor : undefined}
          on:mouseenter={() => onModuleEnter?.(x,y)}
          on:mouseleave={() => onModuleLeave?.(x,y)}
        ></div>
      {/each}
    {/each}
  </div>
</div>

<style lang="sass">
.qr-container
  display: block
  box-sizing: content-box
  margin: 0
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
    box-sizing: border-box
    margin: 0
    padding: 0
    background-color: var(--moduleOffColor)
    width: var(--moduleSize)
    height: var(--moduleSize)

    &.on
      background-color: var(--moduleOnColor)
    
    &.unknown
      background: radial-gradient(circle, var(--moduleOnColor) 50%, var(--moduleOffColor) 50%, var(--moduleOffColor) 100%)
    
    &.highlighted
      border: solid 2px
      border-color: var(--highlightColor)
</style>