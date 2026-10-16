#!/bin/sh
# Lints the add-on with web-ext (Mozilla's addons-linter) in a one-shot
# container (podman, or CONTAINER=docker), so nothing is installed locally.
cd "$(dirname "$0")/.."
exec "${CONTAINER:-podman}" run --rm -v "$PWD:/app:ro,Z" -w /app docker.io/library/node:22-alpine \
  sh -c 'npm install -g --silent web-ext >/dev/null 2>&1 && web-ext lint --source-dir /app --ignore-files "test/**" "tools/**" "docs/**" "dist/**"'
