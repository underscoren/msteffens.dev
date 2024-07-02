<script lang="ts">
    import Post from "$lib/blog/Post.svelte";
    import type { PageData } from "./$types";

    // we do a little funny
    let intros = [
        "", // midnight
        "Isn't it a little late to be looking at my blog?", // 1am
        "",
        "",
        "",
        "",
        "Come now weary traveler, and browse my various musings...", // 6am
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
        "*crickets*", // 10pm
        "",
        "",
    ];

    export let data: PageData;
</script>

<svelte:head>
    <title>Blog | msteffens.dev</title>

    <meta name="description" content="If a blog site has no content does it ever get indexed?" />

    <meta property="og:title" content="Blog" />
    <meta
        property="og:description"
        content="If a blog site has no content does it ever get indexed?"
    />
    <meta property="og:author" content="_n" />

    <meta property="og:url" content={`https://msteffens.dev/blog`} />

    <meta name="twitter:card" content="summary" />
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
                <Post
                    title={post.title}
                    subhead={post.subhead}
                    cover={post.cover}
                    slug={post.slug}
                    created={post.created}
                    edited={post.edited}
                />
            {/each}
        </div>
    </div>
</div>

<style lang="sass">
    @import "../../../node_modules/bulma/sass/utilities/mixins"

    .post-grid
        display: grid
        grid-template-columns: 1fr 1fr 1fr

    @include touch
        .post-grid
            grid-template-columns: 1fr
    
    .section
        margin-bottom: auto
</style>
