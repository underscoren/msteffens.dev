<script lang="ts">
    import "../app.sass";
    import Navbar from "$lib/Navbar.svelte";
    import Footer from "$lib/Footer.svelte";
    import { browser } from "$app/environment";
    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();
</script>

<svelte:head>
    {#if browser}
        <script
            defer
            data-domain="msteffens.dev"
            src="https://pl.msteffens.dev/js/script.js"
        ></script>
    {/if}
</svelte:head>
<Navbar />

{@render children?.()}

<Footer />
