# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Quick and dirty... we'll need to change this later
COPY . .
RUN bun install

EXPOSE 3001/tcp
ENTRYPOINT [ "bun", "run", "./src/index.ts" ]