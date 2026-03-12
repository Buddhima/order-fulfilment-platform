# Order Fulfilment Assessment Starter

This repository is the starter scaffold for the full-stack technical assessment.

Supported Node version for host-side workspace tooling: `>=24.0.0`.

## Run (container runtime, local dependency folders)

1. Install dependencies via Docker:

```bash
npm run deps:install
```

2. Start all services:

```bash
docker compose up
```

3. Access key endpoints:

- GraphQL API: `http://localhost:4000/graphql`
- Web client: `http://localhost:5173`
- MariaDB: `localhost:3307`

Optional configuration:

- Copy `.env.example` to `.env` if you want to override the provided defaults, such as changing mock-service behaviour.
- `SHIPPING_ERROR_MODE` and `FRAUD_ERROR_MODE` support `none`, `unavailable`, and `grpc_unavailable` to help exercise both payload-level and transport-level failure handling.

## Notes

- The canonical development workflow is inside containers.
- Source code is bind-mounted into containers for live editing.
- Service and web-client dependencies live in repo-local `node_modules/` directories.
- Use `npm run deps:install` to populate or refresh those local dependency folders from Docker, including refreshed local `@assessment/proto` tarballs.
- If a clean reinstall is needed, run `npm run deps:reset` before `npm run deps:install`.
- Copy `.env.example` to `.env` only when you need to override the provided defaults.
- `SHIPPING_ERROR_MODE` and `FRAUD_ERROR_MODE` can simulate either payload-level unavailability or real gRPC `UNAVAILABLE` failures.
- `package-lock.json` files are intentionally not committed in this scaffold to avoid repeated local lockfile churn from Docker-run installs.
- `MODEL.md` defines the canonical domain model and workflow invariants in a storage-agnostic form.
- MariaDB is provided, but persistence schema and library choices are intentionally left to candidates.
- Protobuf contracts, buf config, generation scripts, generated stubs, and local tarball packaging are centralised under `packages/proto`.
- Generated stubs are produced under `packages/proto/build`, and the packed local dependency is produced under `packages/proto/dist`.
- `packages/proto/node_modules` remains a host-side workspace dependency folder because `npm run proto:pack` runs from that workspace before the service installs.
- Apollo is wired into `api-gateway`, but GraphQL schema generation, resolver layout, context shape, and module structure are intentionally left to candidates.
- Backend workflow and persistence structure inside `api-gateway` are intentionally left to candidates.
- The React client is intentionally barebones; frontend structure and GraphQL wiring are left for candidates.
- Start implementation with `START_HERE.md`, then use `MODEL.md` as the behavioural source of truth.

## Helpful scripts

- `./scripts/smoke-check.sh` performs a quick API health smoke check.
- `./scripts/wait-for.sh` waits for either an HTTP endpoint or a host/port to become ready.
- `./scripts/run-tests.sh` runs tests in selected containers. tweak if needed.
- `npm run deps:install` runs `npm run proto:pack` and then installs service and web-client dependencies into repo-local `node_modules/` directories by running `npm install` inside Docker.
- `npm run deps:reset` removes those repo-local dependency directories from Docker for a clean reinstall.
- `npm run proto:lint` validates protobuf files using the `@assessment/proto` workspace tooling; it expects `packages/proto/node_modules` to already exist.
- `npm run proto:stubs` regenerates protobuf JS/TS stubs under `packages/proto/build`; it also expects `packages/proto/node_modules` to already exist.
- `npm run proto:pack` regenerates stubs and packs `@assessment/proto` into `packages/proto/dist`; this is the bootstrap-friendly proto command because it installs `packages/proto` dependencies on demand.
- `npm run deps:install` already runs `npm run proto:pack` first, so a fresh checkout can start there safely.
