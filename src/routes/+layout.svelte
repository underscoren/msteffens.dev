<script lang="ts">
    import "../app.sass";
    import Navbar from "$lib/Navbar.svelte";
    import Footer from "$lib/Footer.svelte";
    import { browser } from "$app/environment";
</script>

<svelte:head>
    {#if browser}
        <script defer data-domain="msteffens.dev" src="https://msteffens.dev/js/script.js"></script>
    {/if}
</svelte:head>
<Navbar />

<slot />

<Footer />
