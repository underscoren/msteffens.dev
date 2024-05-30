import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, fetch }) => {
    const response = await fetch(`${url.origin}/api/posts.json`);

    return { posts: (await response.json()) as PostMetadata[] };
};
