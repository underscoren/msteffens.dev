import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { SvelteComponent } from "svelte";

export const load: PageLoad = async ({ params }) => {
    try {
        const post = (await import(`../../../posts/${params.slug}.svx`)) as {
            default: typeof SvelteComponent;
            metadata: PostMetadata;
        };

        return {
            Contents: post.default,
            meta: { ...post.metadata, slug: params.slug },
        };
    } catch (err) {
        return error(404, err as Error);
    }
};
