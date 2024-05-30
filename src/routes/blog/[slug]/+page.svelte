<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    const { title, subhead, cover, alt, coverWidth, coverHeight, created, edited } = data.meta;

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
</script>

<svelte:head>
    <title>msteffens.dev - {title}</title>
</svelte:head>

<section class="section">
    <article class="content">
        <div class="columns">
            <div id="aside" class="column is-3">
                <!-- aside content -->
            </div>
            <div class="column">
                <img class="cover" src={cover} {alt} />

                <h1>{title}</h1>

                <div class="meta">
                    <strong>Written:</strong>
                    {formatDate(created)} <br />
                    <strong>Updated:</strong>
                    {formatDate(edited)}
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
