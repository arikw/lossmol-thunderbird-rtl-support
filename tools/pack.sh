#!/bin/sh
# Builds dist/lossmol-<version>.xpi: only the files the add-on needs. Uses the
# zip command on this machine (nothing else is installed).
set -e
cd "$(dirname "$0")/.."
version=$(python3 -c 'import json; print(json.load(open("manifest.json"))["version"])')
mkdir -p dist
out="dist/lossmol-$version.xpi"
rm -f "$out"
zip -q -X -r "$out" manifest.json background.js compose.js display.js display.css \
  lib/direction.js lib/blocks.js options/options.html options/options.css options/options.js \
  icons _locales
echo "$out"
