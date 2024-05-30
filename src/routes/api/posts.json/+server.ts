import getAllPostMetadata from "$lib/util/getAllPostMetadata";
import { json } from "@sveltejs/kit";

export const prerender = true;

export const GET = async () => {
    const posts = await getAllPostMetadata({ limit: 24 });

    return json(posts);
};
