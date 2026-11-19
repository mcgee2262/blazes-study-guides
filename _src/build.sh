#!/bin/bash
# Wraps the artifact fragments into full HTML documents for GitHub Pages.
set -e
SRC="$(cd "$(dirname "$0")" && pwd)"; OUT="$HOME/BlazesStudyGuides"
wrap(){ { printf '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>[hidden]{display:none!important}body{margin:0}</style>\n'
  awk '!done && /^<header class="rail">|^<body-start>/{print "</head><body>"; done=1} {print}' "$1"
  printf '\n</body></html>\n'; } > "$2"; }
wrap "$SRC/physics-classroom.html" "$OUT/physics/index.html"
mkdir -p "$OUT/history-road-to-war"; wrap "$SRC/history-classroom.html" "$OUT/history-road-to-war/index.html"
[ -d "$SRC/history-audio" ] && rsync -a "$SRC/history-audio/" "$OUT/history-road-to-war/audio/"
wrap "$SRC/early-republic-classroom.html" "$OUT/early-republic-unit3/index.html"
[ -f "$SRC/hub.html" ] && wrap "$SRC/hub.html" "$OUT/index.html"
[ -d "$SRC/physics-audio" ] && rsync -a --delete "$SRC/physics-audio/" "$OUT/physics/audio/"
rsync -a "$SRC/katex/" "$OUT/physics/katex/"
rsync -a "$SRC/audio/" "$OUT/early-republic-unit3/audio/"

# Share copy for classmates: history guide only, no hub link (one source, two outputs).
SHARE="$HOME/MondayCincyTest"; mkdir -p "$SHARE"
wrap "$SRC/history-classroom.html" "$SHARE/index.html"; sed -i '' -E 's#<!--HUB-->.*<!--/HUB-->##' "$SHARE/index.html"
[ -d "$SRC/history-audio" ] && rsync -a --delete "$SRC/history-audio/" "$SHARE/audio/"
# Keep the editable sources in the repo too (Jekyll skips folders starting with _).
mkdir -p "$OUT/_src/tools"; cp "$SRC"/physics-classroom.html "$SRC"/history-classroom.html "$SRC"/hub.html "$SRC"/build.sh "$OUT/_src/"; cp "$SRC"/tools/*.js "$SRC"/tools/*.py "$OUT/_src/tools/"
echo built
