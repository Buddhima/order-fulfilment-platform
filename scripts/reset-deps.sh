#!/usr/bin/env sh

set -eu

for service in api-gateway mock-inventory mock-shipping mock-fraud web-client; do
	docker compose run --rm --no-deps "$service" rm -rf node_modules
done
