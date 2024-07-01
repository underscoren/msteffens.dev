<script lang="ts">
    import type { PageData } from "./$types";
    import "prism-themes/themes/prism-lucario.min.css"
    
    export let data: PageData;

    const { title, subhead, cover, alt, coverWidth, coverHeight, created, edited, slug } = data.meta;

    const pad = (number: number) => `${number}`.padStart(2, "0");

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}`;
    }
</script>

<svelte:head>
    <title>{title} | msteffens.dev</title>
    
    <meta name="description" content={subhead}>
    
    <meta property="og:title" content={title} />
    <meta property="og:description" content={subhead}>
    <meta property="og:author" content="_n" />

    <meta property="og:type" content="article" />
    <meta property="og:published_time" content={created} />
    
    {#if created != edited}
    <meta property="og:modified_time" content={edited} />
    {/if}
    
    {#if cover}
    <meta property="og:img" content={`https://msteffens.dev${cover}`} />
    {/if}
    
    <meta property="og:url" content={`https://msteffens.dev/blog/${slug}`} />

    <meta name="twitter:card" content="summary" />
    <!-- the meta tags are still prefixed with twitter lol -->
</svelte:head>

<section class="section">
    <article class="content">
        <div class="columns">
            <div id="aside" class="column is-2">
                <!-- TODO: aside content -->
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
