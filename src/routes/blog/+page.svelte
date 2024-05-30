<script lang="ts">
    import type { PageData } from "./$types";

    // we do a little funny
    let intros = [
        "", // midnight
        "Isn't it a little late to be looking at my blog?", // 1am
        "",
        "",
        "",
        "",
        "Come now weary traveller, and browse my various musings...", // 6am
        "",
        "Time to grab some coffee, it's gonna be a long day.", // 8am
        "",
        "",
        "",
        "A post a day keeps the bugs away.", // midday
        "",
        "",
        "", // 3pm
        "",
        "",
        "", // 6pm
        "",
        "",
        "", // 10pm
        "",
        "",
    ];

    export let data: PageData;
</script>

<svelte:head>
    <title>msteffens.dev - Blog</title>
</svelte:head>

<section class="section">
    <div class="container content">
        <h1 class="title is-text-monospace">Blog</h1>
        <p>{intros[new Date().getHours()] || "Rather empty in here, isn't it?"}</p>
    </div>
</section>

<div class="section">
    <div class="container content">
        <div class="post-grid">
            {#each data.posts ?? [] as post}
                <article>
                    <a href={`/blog/${post.slug}`}>
                        <div class="post-cover" style:background-image={`url(${post.cover})`}></div>
                        <h1>{post.title}</h1>
                        <p class="subhead">{post.subhead}</p>
                        <p class="dates">
                            C: {post.created}
                            {#if post.created != post.edited}
                                <br />E: {post.edited}
                            {/if}
                        </p>
                    </a>
                </article>
            {/each}
        </div>
    </div>
</div>

<style lang="sass">
    @import "../../style/colors"
    @import "../../../node_modules/bulma/sass/utilities/mixins"

    .post-grid
        display: grid
        grid-template-columns: 1fr 1fr 1fr

        article
            padding: 0.5rem
            
            a
                display: block
                width: 100%
                height: 100%
                color: $white

            h1
                margin: 0.5rem 0rem
                font-size: 16pt
                text-overflow: ellipsis
            
            .dates
                font-size: 10pt
                

        .post-cover
            width: 100%
            height: 8rem
            background-size: cover
            background-position: center center

    @include touch
        .post-grid
            grid-template-columns: 1fr
    
    .section
        margin-bottom: auto
</style>
