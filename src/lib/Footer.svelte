<script lang="ts">
    import { page } from "$app/stores";

    let url = $derived(
        `https://github.com/underscoren/msteffens.dev/blob/master/src/routes${$page.url.pathname == "/" ? "" : $page.url.pathname}/+page.svelte`
    );
    let blogpostUrl = $derived(
        `https://github.com/underscoren/msteffens.dev/blob/master/src/posts/${$page.params.slug}.svx`
    );
</script>

<footer class="footer" style:justify-self={"end"}>
    <div class="content has-text-centered">
        <p>
            <strong>msteffens.dev</strong>
        </p>
        <p>
            The site <a href="https://github.com/underscoren/msteffens.dev">source code</a> and
            contents made by me is licensed under
            <a href="https://github.com/underscoren/msteffens.dev/blob/master/LICENSE">ISC</a>. All
            other content and libraries use <a href="/license">their own licences</a>.<br />
            {#if $page.url.pathname.includes("/blog/")}
                Spotted an error? Check out the source for this page <a href={blogpostUrl}>here</a>,
                and submit an issue or PR please!
            {:else}
                You can check out the source for this page <a href={url}>here</a>.
            {/if}
        </p>
        <p>
            I use self-hosted <a href="https://plausible.io">Plausible</a> for privacy-focused
            analytics.<br />
            No cookies or data are stored, no personal information is tracked, all data is in aggregate.
            See <a href="/privacy">privacy</a> for more details.
        </p>
    </div>
</footer>
