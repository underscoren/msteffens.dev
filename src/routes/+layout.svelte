<script lang="ts">
    import "../app.sass";
    import Navbar from "$lib/Navbar.svelte";
    import Footer from "$lib/Footer.svelte";
</script>

<Navbar />

<slot />

<Footer />
