<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { GroupColor } from "./qrUtils";

    export let groups: string[][][];
    export let colors: GroupColor[][][];

    const dispatcher = createEventDispatcher();
</script>

{#each groups as group, g}
    <div class="group">
        <span class="title">Group {g}</span>
        {#each group as block, b}
            <div class="block">
                <p>
                    Block {b}: {#each block as bits, i}<code
                            on:mouseenter={() => dispatcher("hoveron", { g, b, i })}
                            on:mouseleave={() => dispatcher("hoveroff", { g, b, i })}
                            style:background-color={`hsl(${colors[g][b][i].blockHue}deg 75% ${colors[g][b][i].byteValue}%)`}
                            style:color={colors[g][b][i].byteValue > 50 ? "#000" : "#fff"}
                            >{colors[g][b][i].byte}</code
                        >{/each}
                </p>
            </div>
        {/each}
    </div>
{/each}

<style lang="sass">
.group
    margin-left: 1rem

    .title
        font-size: 1.25rem

.block
    margin-left: 1rem
</style>
