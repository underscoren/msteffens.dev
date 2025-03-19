<script lang="ts">
    let showNav = $state(false);
</script>

<!-- svelte-ignore a11y_no_redundant_roles -->
<nav class="navbar" role="navigation" aria-label="main navigation">
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <img width="30" src="/logo.png" alt="Logo" />
        </a>

        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_missing_attribute -->
        <a
            role="button"
            class="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            onclick={() => (showNav = !showNav)}
        >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div class:is-active={showNav} class="navbar-menu">
        <div class="navbar-start">
            <a class="navbar-item" href="/">Home</a>
            <a class="navbar-item" href="/tool">Tools</a>
            <a class="navbar-item" href="/blog">Blog</a>
            <a class="navbar-item" href="/privacy">Privacy</a>
        </div>
    </div>
</nav>

<style lang="sass">
    @use "../style/colors"

    nav
        border-bottom: solid 1px colors.$blue
</style>
