#!/usr/bin/env sh

set -eu

npm run deps:install

for service in api-gateway mock-inventory mock-shipping mock-fraud; do
	docker compose run --rm --no-deps "$service" npm test
done

docker compose run --rm --no-deps web-client npm test
