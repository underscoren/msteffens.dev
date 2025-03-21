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
- CI/CD:
    - Docker
    - Docker Compose
    - [Drone CI](https://www.drone.io/)

## Development

You will need Node.js, something recent like the latest LTS.

Clone the repo and then

```bash
npm install

npm run dev
```

Which will start a dev server. You can make changes and it will automatically re-build and reload live. Check out more details at [https://svelte.dev](https://svelte.dev)

Make sure to run `npm run format` before comitting to auto-format your code!

TODO: Unit tests (famous last words)

## Building

Checkout the `Dockerfile`, `docker-compose.yml` and `.drone.yml` to see how I do automated building and deployment.

Technically, the only thing you need to build the site is

```bash
npm run build
```

Then, you can run

```bash
node build
```

To run the built sveltekit web server.

Personally, I use Docker Compose and Drone CI to make automated builds and handle server process management easier. When I push a commit to github the `.drone.yml` pipeline runs on my server (self-hosted Drone CI server), basically doing:

```bash
cd /my/container
git pull
docker compose up -d --build
```

This pulls any remote changes, rebuilds the docker image locally, and re-starts the container with the latest build image and the config stored at `docker-compose.yml`
