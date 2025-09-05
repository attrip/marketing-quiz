#!/usr/bin/env bash
set -euo pipefail

DIR=${1:-src/app}
PORT=${2:-8080}

if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Python is required to serve files (python3 -m http.server)." >&2
  exit 1
fi

URL="http://localhost:${PORT}"

# Try to open browser (macOS 'open', Linux 'xdg-open')
if command -v open >/dev/null 2>&1; then
  (sleep 1; open "$URL") &
elif command -v xdg-open >/dev/null 2>&1; then
  (sleep 1; xdg-open "$URL") &
fi

echo "Serving '$DIR' at ${URL} (Ctrl+C to stop)"
exec "$PY" -m http.server "$PORT" --directory "$DIR"

