<script lang="ts">
    import { page } from "$app/stores";


</script>

<section class="section">
    <div class="container content">
        <h1 class="title">Error {$page.status}</h1>
        <p>{$page.error?.message}</p>
        <br>
        <p>Maybe try again, or go <a href="/">Home</a></p>
    </div>
</section>
