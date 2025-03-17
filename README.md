# msteffens.dev

[![wakatime](https://wakatime.com/badge/user/11612492-942b-4434-89a1-5e31d943fa36/project/8517c440-f314-4c78-8f6e-6493f3e2a2c7.svg)](https://wakatime.com/badge/user/11612492-942b-4434-89a1-5e31d943fa36/project/8517c440-f314-4c78-8f6e-6493f3e2a2c7)

My personal site.

Blog section heavily inspired by [josh-collinsworth/sveltekit-blog-starter](https://github.com/josh-collinsworth/sveltekit-blog-starter)

Stack:

- Tooling: Vite
- Framework: SvelteKit
- Languages:
    - TypeScript
    - SASS
- Libraries:
    - Bulma (for styling)
- DevOps:
    - Docker
    - Github Actions

## Development

You will need Node.js, something recent like the latest LTS.

Clone the repo and then

```bash
npm install

npm run dev
```

Which will start a dev server. You can make changes and it will automatically re-build and reload live. Check out more details at [https://kit.svelte.dev](https://kit.svelte.dev)

Make sure to run `npm run format` before comitting to auto-format your code!

TODO: Unit tests (famous last words)

## Building

Checkout the `Dockerfile`, `docker-compose.yml` and `.github/workflows` to see how I do automated building and deployment. Personally, I use docker to make hosting and deployment easier.

Technically, the only thing you need to build the site is

```bash
npm run build
```

Then, you can run

```bash
node build
```

To run the built sveltekit web server.

However, I use Docker to build an image, then upload that directly to my server.
I prefer to use docker compose files to manage my containers. This is a personal site, so uploading to dockerhub seems dumb. The next best step is hosting your own registry, which also seems dumb for just a single image. The last rung seems to be just sending the image over ssh to the server, which is why my build & deploy looks like:

```bash
docker build . --tag msteffens.dev:latest
docker save msteffens.dev | bzip2 | ssh user@server docker load
```

After which it's just a case of re-creating the container, which should be using the `:latest` image.
