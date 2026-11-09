#!/bin/sh
# Deploy the reader to Cloudflare Pages (nero-rome-visual.pages.dev, production branch main): the eight files the page loads, nothing else from dist/
# (test and audit pages stay local). A Pages direct upload replaces the whole site, so every file the page needs must be in it.
# Needs `npm run build` first and a wrangler login on this machine (`npx wrangler@3 login`; wrangler 3 runs on Node 20, wrangler 4 needs Node 22).
set -e
cd "$(dirname "$0")/.."
D=$(mktemp -d)
for f in index.html book.js rome-assets.js antium-assets.js aurea-assets.js oppian-assets.js construction-assets.js music-box-canon.m4a; do cp "dist/$f" "$D/"; done
npx --yes wrangler@3 pages deploy "$D" --project-name nero-rome-visual --branch main --commit-hash "$(git rev-parse HEAD)" --commit-message "$(git log -1 --format=%s)"
rm -rf "$D"
