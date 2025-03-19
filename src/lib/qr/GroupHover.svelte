<script lang="ts">
    import type { GroupColor } from "./qrUtils";

    interface Props {
        groups: string[][][];
        colors: GroupColor[][][];
        hoveron: (data: { g: number, b: number, i: number }) => any
        hoveroff: () => any
    }

    let { groups, colors, hoveron, hoveroff }: Props = $props();
</script>

{#each groups as group, g}
    <div class="group">
        <span class="title">Group {g}</span>
        {#each group as block, b}
            <div class="block">
                <p>
                    Block {b}: 
                    {#each block as bits, i}
                        <code
                            onmouseenter={() => hoveron({ g, b, i })}
                            onmouseleave={() => hoveroff()}
                            style:background-color={`hsl(${colors[g][b][i].blockHue}deg 75% ${colors[g][b][i].byteValue}%)`}
                            style:color={colors[g][b][i].byteValue > 50 ? "#000" : "#fff"}
                            >
                            {colors[g][b][i].byte}
                        </code>
                    {/each}
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
