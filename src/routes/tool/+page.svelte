<svelte:head>
    <title>Tools | msteffens.dev</title>

    <meta name="description" content="Various tools and utilities" />

    <meta property="og:title" content="Tools" />
    <meta property="og:description" content="Various tools and utilities" />

    <meta property="og:url" content={`https://msteffens.dev/tool`} />

    <meta name="twitter:card" content="summary" />
</svelte:head>

<section class="section">
    <div class="container content">
        <h1 class="title is-text-monospace">Tools</h1>
    </div>
</section>

<div class="section">
    <div class="container content">
        <div class="tool-grid">
            <!-- TODO: make this less terrible -->
            <article>
                <a href={`/tool/mudqr`}>
                    <div class="tool-cover" style:background-image={`url(/img/qr/qr_hm.png)`}></div>
                    <h1>Hackmud QR Reader</h1>
                    <p>QR decoder showing advanced debug information</p>
                </a>
            </article>
        </div>
    </div>
</div>

<section class="section">
    <div class="container content">
        <p>Yeah there will be more stuff here at some point...</p>
    </div>
</section>

<style lang="sass">
    @import "../../../node_modules/bulma/sass/utilities/mixins"
    @import "../../style/colors"

    .tool-grid
        display: grid
        grid-template-columns: 1fr 1fr 1fr

    @include touch
        .tool-grid
            grid-template-columns: 1fr
    
    .section
        margin-bottom: auto

    
    article
        padding: 0.5rem
        
        a
            display: block
            width: 100%
            height: 100%
            color: $white

        h1
            margin: 0.5rem 0rem
            font-size: 16pt
            text-overflow: ellipsis
        
        .dates
            font-size: 10pt
            

    .tool-cover
        width: 100%
        height: 12rem
        background-size: cover
        background-position: center center
</style>
