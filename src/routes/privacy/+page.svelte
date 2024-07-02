<svelte:head>
    <title>Privacy | msteffens.dev</title>

    <meta name="description" content="Privacy information" />

    <meta property="og:title" content="Privacy" />
    <meta property="og:description" content="Privacy information" />

    <meta property="og:url" content={`https://msteffens.dev/privacy`} />

    <meta name="twitter:card" content="summary" />
</svelte:head>

<section class="section" style="height: 100%">
    <div class="container content">
        <h1 class="title is-text-monospace">Privacy</h1>

        <p>
            I use a self-hosted <a href="https://plausible.io">Plausible</a> instance for
            privacy-focused, anonymous analytics.<br />
            It is free and open-source, so anyone can see exactly what is being tracked.<br />
        </p>
        <p>
            Plausible does not use cookies or store data on your browser for tracking. It does not
            collect any personal information, and all data is aggregated specifically to make
            individual user tracking infeasible. I self-host, so the data never leaves my server
            either.
        </p>
        <p>
            For more information about exactly what and how data is tracked, check out <a
                href="https://plausible.io/data-policy">their data policy</a
            >.
        </p>
    </div>
</section>

<style lang="sass">
    .section
        margin-bottom: auto
</style>
