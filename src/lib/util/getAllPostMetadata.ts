const EXTENSION_LENGTH = ".svx".length;

export default async function getAllPostMetadata({ limit }: { limit?: number }) {
    // grab all the .svx files in src/posts
    const postImports = import.meta.glob("/src/posts/*.svx");
    const postPromises = Object.entries(postImports).map(async ([path, resolver]) => {
        // grab the frontmatter from the resolved mdsvex import
        const { metadata } = (await resolver()) as { metadata: PostMetadata };

        // the slug will just be the last element in the path, minus the file extension
        const slug = path.split("/").pop()?.slice(0, -EXTENSION_LENGTH);

        return { ...metadata, slug };
    });

    const allPosts = await Promise.all(postPromises);

    // sort newest first
    const sorted = allPosts.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    // typed convenience function to (shallow) copy specific properties of an object
    const copyProperties = <T>(object: T, properties: (keyof T)[]) => {
        const copy = {} as T;

        for (const property of properties) copy[property] = object[property];

        return copy;
    };

    return sorted
        .slice(0, limit ?? sorted.length) // limit results
        .map((post) =>
            copyProperties(
                post, // copy only relevant properties
                [
                    "title",
                    "subhead",
                    "cover",
                    "alt",
                    "coverWidth",
                    "coverHeight",
                    "created",
                    "edited",
                    "slug",
                ]
            )
        );
}
