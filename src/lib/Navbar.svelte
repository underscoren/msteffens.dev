<script lang="ts">
    let showNav = $state(false);
</script>

<nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <img width="30" src="/logo.png" alt="Logo" />
        </a>

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
    @import "../style/colors"

    nav
        border-bottom: solid 1px $blue
</style>
