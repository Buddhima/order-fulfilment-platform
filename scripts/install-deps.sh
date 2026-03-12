#!/usr/bin/env sh

set -eu

HOST_UID="$(id -u)"
HOST_GID="$(id -g)"

for service in api-gateway mock-inventory mock-shipping mock-fraud; do
	docker compose run --rm --no-deps --user "${HOST_UID}:${HOST_GID}" -e HOME=/tmp "$service" sh -c 'rm -rf node_modules/@assessment/proto && npm install --no-audit --no-fund --package-lock=false'
done

docker compose run --rm --no-deps --user "${HOST_UID}:${HOST_GID}" -e HOME=/tmp web-client npm install --no-audit --no-fund --package-lock=false
