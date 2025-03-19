<script lang="ts">
    import { page } from "$app/stores";
</script>

<section class="section" style="height: 100%">
    <div class="container content">
        <h1 class="title">Error {$page.status}</h1>
        <p>{$page.error?.message}</p>
        <br />
        <p>Maybe try again, or go <a href="/">Home</a></p>
        <p>If this is something important please <a href="https://github.com/underscoren/msteffens.dev/issues/new">raise an issue</a> on my github!</p>
    </div>
</section>
