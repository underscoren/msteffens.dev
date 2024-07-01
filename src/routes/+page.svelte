<script lang="ts">
    import coneURL from "./img/cone_outline.gif";
</script>

<svelte:head>
    <title>Home | msteffens.dev</title>
</svelte:head>

<section class="section">
    <div class="container content">
        <h1 class="title is-text-monospace">msteffens.dev</h1>
    </div>
</section>
<div class="fullscreen flex-centered">
    <p>
        <img class="pixellated" width="64" src={coneURL} alt="construction cone" />
    </p>
    <p>Under construction</p>
    <br />
    <p>In the meantime maybe check out the <a href="/blog">blog</a>?</p>
</div>
