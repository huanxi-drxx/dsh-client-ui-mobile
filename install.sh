#!/usr/bin/env bash
# dsh-client-ui-mobile installer
# Usage: ./install.sh [profile-dir]   (default: ${DSH_HOME:-$HOME/.dsh}/profiles/web)
set -euo pipefail

PROFILE="${1:-${DSH_HOME:-$HOME/.dsh}/profiles/web}"
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$PROFILE/node_modules/@local/dsh-client-ui-mobile"
PATCH="$PROFILE/cordis.patch.yml"

echo "== dsh-client-ui-mobile installer =="
echo "profile: $PROFILE"

[ -d "$PROFILE" ] || { echo "ERROR: profile directory not found: $PROFILE"; echo "Is DSH with the web profile installed? (expects ~/.dsh/profiles/web)"; exit 1; }

# 1. copy the package
mkdir -p "$(dirname "$DEST")"
rm -rf "$DEST"
mkdir -p "$DEST/lib"
cp "$SRC/package.json" "$DEST/"
cp "$SRC/lib/index.js" "$SRC/lib/client.js" "$DEST/lib/"
echo "plugin copied -> $DEST"

# 2. add the composition rows (ui-mobile + multi-model web search provider)
if [ -f "$PATCH" ] && grep -q 'dshm-search' "$PATCH" && grep -q 'ui-mobile' "$PATCH"; then
  echo "cordis.patch.yml already contains the ui-mobile + web-search rows; nothing to add."
else
  if [ -f "$PATCH" ]; then
    # drop a bare '[]' empty-array line (default profile composition) so block
    # inserts can be appended
    sed -i '/^\[\]$/d' "$PATCH"
  fi
  cat >> "$PATCH" <<'EOF'

# Mobile responsive drawer layout + multi-model web search (dsh-client-ui-mobile)
- id: web
  config:
    searchProvider: dshm-search

- insert:
    - id: ui-mobile
      name: '@local/dsh-client-ui-mobile'
EOF
  echo "composition rows added -> $PATCH"
fi

echo
echo "Done. Next steps:"
echo "  1. restart dsh (web profile)"
echo "  2. hard-refresh the browser (Ctrl/Cmd+Shift+R, or mobile reload)"
echo "Desktop stays untouched; mobile devices get the drawer layout automatically."
