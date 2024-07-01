<script lang="ts">
    import type { PageData } from "./$types";
    import "prism-themes/themes/prism-lucario.min.css"
    
    export let data: PageData;

    const { title, subhead, cover, alt, coverWidth, coverHeight, created, edited } = data.meta;

    const pad = (number: number) => `${number}`.padStart(2, "0");

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}`;
    }
</script>

<svelte:head>
    <title>{title} | msteffens.dev</title>
</svelte:head>

<section class="section">
    <article class="content">
        <div class="columns">
            <div id="aside" class="column is-2">
                <!-- aside content -->
            </div>
            <div class="column is-8-desktop">
                <img class="cover" src={cover} {alt} />

                <h1 class="is-text-monospace">{title}</h1>

                <div class="meta">
                    <strong>Written:</strong>
                    {formatDate(created)} <br />
                    {#if created != edited}
                    <strong>Updated:</strong>
                    {formatDate(edited)}
                    {/if}
                </div>

                <svelte:component this={data.Contents} />
            </div>
        </div>
    </article>
</section>

<style lang="sass">
    .section
        margin-bottom: auto
</style>
