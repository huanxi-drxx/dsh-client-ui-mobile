#!/usr/bin/env bash
# dsh-client-ui-mobile uninstaller
# Usage: ./uninstall.sh [profile-dir]   (default: ${DSH_HOME:-$HOME/.dsh}/profiles/web)
set -euo pipefail

PROFILE="${1:-${DSH_HOME:-$HOME/.dsh}/profiles/web}"
PATCH="$PROFILE/cordis.patch.yml"

echo "== dsh-client-ui-mobile uninstaller =="
echo "profile: $PROFILE"

# 1. remove the package
rm -rf "$PROFILE/node_modules/@local/dsh-client-ui-mobile"
echo "plugin package removed"

# 2. remove the composition row (the ui-mobile insert block)
if [ -f "$PATCH" ]; then
  sed -i "/^# Mobile responsive drawer layout (dsh-client-ui-mobile)$/,/name: '@local\/dsh-client-ui-mobile'$/d" "$PATCH"
  echo "composition row removed -> $PATCH"
fi

echo
echo "Done. Restart dsh (web profile) and hard-refresh the browser."
