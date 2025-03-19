<script lang="ts">
    interface Props {
        slug: string;
        cover: string;
        title: string;
        subhead: string;
        created: string;
        edited: string;
    }

    let { slug, cover, title, subhead, created, edited }: Props = $props();
</script>

<article>
    <a href={`/blog/${slug}`}>
        <div class="post-cover" style:background-image={`url(${cover})`}></div>
        <h1>{title}</h1>
        <p class="subhead">{subhead}</p>
        <p class="dates">
            C: {created}
            {#if created != edited}
                <br />E: {edited}
            {/if}
        </p>
    </a>
</article>

<style lang="sass">
    @use "../../style/colors"
    article
        padding: 0.5rem
        
        a
            display: block
            width: 100%
            height: 100%
            color: colors.$white

        h1
            margin: 0.5rem 0rem
            font-size: 16pt
            text-overflow: ellipsis
        
        .dates
            font-size: 10pt
            

    .post-cover
        width: 100%
        height: 8rem
        background-size: cover
        background-position: center center
</style>
