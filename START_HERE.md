# Start Here

This is the authoritative candidate entrypoint for the assessment.

The starter is intentionally incomplete. The goal is to assess implementation choices, architecture, and debugging approach.

## Read these in order

1. `START_HERE.md` for scope, deliverables, and candidate expectations.
2. `README.md` for setup, commands, and local runtime workflow.
3. `MODEL.md` for the canonical domain model, workflow rules, and invariants.
4. `DECISIONS.md` for assumptions, extensions, and trade-offs you choose to document.

## Context

Customers place orders through a GraphQL API.
An order can only be confirmed after coordination with external services over gRPC:

- `InventoryService` reserves items.
- `ShippingQuoteService` returns a shipping quote.
- `FraudScoreService` returns a fraud-risk score.

## What is already provided

- Docker Compose orchestration with repo-local `node_modules/` directories populated from Docker.
- Apollo server wiring in `services/api-gateway`, with GraphQL structure intentionally left open.
- gRPC contracts, buf config, generation scripts, and generated stubs in `packages/proto/`.
- Local gRPC package artefacts under `packages/proto/build/` and `packages/proto/dist/`.
- Running mock dependency services (`mock-inventory`, `mock-shipping`, `mock-fraud`).
- MariaDB runtime service in Docker Compose.
- Canonical domain model in `MODEL.md`.
- React shell structure in `web-client`.

## Backend requirements

Implement the main workflow in `services/api-gateway`:

1. `createOrder(input)` mutation
2. `order(id)` query
3. `orders(filter)` query
4. `confirmOrder(id)` mutation

Core expectations:

- Persist orders and state transitions in MariaDB.
- `confirmOrder` succeeds only if inventory reservation succeeds, fraud score is acceptable under a documented threshold, and a shipping quote is available.
- Handle external gRPC failures reasonably, including timeout, retry, or error-mapping choices where appropriate.
- Define and organise domain, persistence, and integration modules inside `services/api-gateway/src/`.
- Decide where generated gRPC clients from `@assessment/proto` live in your app structure and wire them in.
- Choose your own internal workflow abstraction; the starter does not prescribe a service class or domain module layout.

## Frontend requirements

Build a simple React client in `web-client` inside the same Docker Compose environment.

The UI must include:

- Create Order: required form fields are customer identifier, one or more items, and optional destination or postal code; submit via `createOrder(input)` and show loading, success, and failure states.
- Order List: display orders from `orders(filter)`, include status filtering for at least `PENDING`, `CONFIRMED`, and `FAILED`, and show loading and empty states.
- Order Detail: fetch one order via `order(id)` and show at least id, status, items, fraud decision data if available, shipping quote if available, and latest failure reason if available.
- Confirm Order: trigger `confirmOrder(id)`, show loading, success, and failure feedback, and reflect updated order state after completion.
- Basic UX quality: validate required fields and quantity `> 0`, keep the UI usable on desktop and mobile widths, and keep code clear and maintainable.

## Testing expectations

- Replace starter placeholder tests with meaningful tests.
- Include unit tests for core business logic.
- Include integration tests for gRPC interactions, covering the happy path and at least one failure path.
- Failure-path tests may use either payload-level mock unavailability or transport-level gRPC `UNAVAILABLE` responses from the provided mock services.
- Include API-level tests for GraphQL operations.
- Include at least one frontend component or flow-level test.
- Keep tests deterministic and clearly aligned to business behaviour.

## Deliverables

- A working solution runnable via `npm run deps:install` and `docker compose up`.
- `README.md` with architecture overview, run or test instructions, and assumptions or trade-offs.
- `DECISIONS.md` with key design decisions and alternatives considered.
- Tests with enough documentation for a reviewer to run them.

## Notes

- Treat `MODEL.md` as the source of truth for workflow fields, invariants, and state transitions.
- If you make a reasonable choice for behaviour that is not explicitly specified, keep it consistent and record it in `DECISIONS.md`.
- You may extend the model, read model, or API shape if needed, as long as the core model and invariants remain intact and you document the extension in `DECISIONS.md`.
- If a dependency behaves inconsistently with its contract, investigate and resolve it at source.
- The starter local mock inventory service is seeded with these SKUs: `SKU-RED-CHAIR`, `SKU-BLUE-LAMP`, `SKU-WHITE-DESK`, `SKU-GREY-SHELF`.
- Copy `.env.example` to `.env` only if you want to override the provided defaults, such as changing mock-service behaviour.
- `SHIPPING_ERROR_MODE` and `FRAUD_ERROR_MODE` can be used to simulate both payload-level failures and real gRPC transport failures.
- Refresh the local gRPC package with `npm run proto:pack` if contracts under `packages/proto/proto/` change.
- `package-lock.json` files are intentionally excluded from this scaffold repository to avoid churn from repeated Docker-run installs.

## Non-goals

- Production-grade completeness is not required.
- Prefer clear reasoning and maintainable structure over over-engineering.
- If you do not finish everything, prioritise documenting what you would do next.
