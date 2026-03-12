#!/usr/bin/env sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
HEALTH_URL="http://localhost:4000/health"

"${SCRIPT_DIR}/wait-for.sh" "${HEALTH_URL}" 90

curl \
	--silent \
	--show-error \
	--fail \
	"${HEALTH_URL}"

echo
echo "Smoke check completed"
