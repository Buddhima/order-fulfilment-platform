#!/usr/bin/env sh

set -eu

PACKAGE_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

cd "${PACKAGE_DIR}"

if [ ! -d node_modules ]; then
	npm install --no-audit --no-fund --workspaces=false
fi

rm -rf build
./node_modules/.bin/buf generate

mkdir -p dist
rm -f dist/*.tgz

PACKED_TARBALL="$({
	npm pack --pack-destination dist
})"

echo "Generated protobuf artefacts in ${PACKAGE_DIR}/build and packed dist/${PACKED_TARBALL}"
