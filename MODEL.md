# Domain Model

This document defines the business model for the assessment in a language-agnostic form.
It is the source of truth for entity meaning, relationships, and required workflow behaviour.

## Scope

- In scope: order workflow owned by `api-gateway` (`createOrder`, `order`, `orders`, `confirmOrder`).
- External dependencies: `InventoryService`, `ShippingQuoteService`, and `FraudScoreService`.
- Runtime datastore: MariaDB (storage design and access approach are candidate decisions).

## Core Entities

### Order

- `id`: unique immutable identifier for the order.
- `customerIdentifier`: required customer reference string.
- `destinationPostalCode`: optional destination code used for shipping quote calculation.
- `status`: one of `PENDING`, `CONFIRMED`, `FAILED`.
- `items`: one or more `OrderItem` values.
- `fraudScore`: optional integer score produced during confirmation.
- `shippingAmount`: optional numeric quote amount produced during confirmation.
- `latestError`: optional latest failure reason.
- `createdAt`: creation timestamp.
- `updatedAt`: last update timestamp.

### OrderItem

- `sku`: required stock identifier.
- `quantity`: required positive integer (`> 0`).

### OrderEvent (recommended model concept)

- Represents an immutable, timestamped workflow event for an order.
- Common examples: order created, confirmation started, dependency call outcome, order confirmed, order failed.
- Event persistence format is implementation-defined.

## Relationships

- One `Order` has one-or-more `OrderItem` values.
- One `Order` may have zero-or-more `OrderEvent` entries.

## Lifecycle and State Rules

### createOrder(input)

- Validates input (at least one item; each quantity `> 0`).
- Creates a new order in `PENDING` status.
- Persists order and items consistently.

### confirmOrder(id)

- Precondition: order exists and is currently `PENDING`.
- Calls dependencies to reserve inventory, score fraud risk, and obtain shipping quote.
- Confirmation succeeds only when:
  - inventory reservation succeeds,
  - fraud score is acceptable under a documented threshold,
  - shipping quote is available.
- On success: status transitions to `CONFIRMED`.
- On required dependency/business failure: status transitions to `FAILED` and `latestError` is set.
- `CONFIRMED` and `FAILED` are terminal statuses for this assessment.

### order(id) and orders(filter)

- `order(id)` returns one order with its items and current decision fields.
- `orders(filter)` supports optional status filtering.
- If no filter is supplied, all orders are eligible to be returned.

## Invariants

- Order identifiers are unique.
- Quantity is always a positive integer.
- Status transitions are monotonic for this workflow:
  - `PENDING -> CONFIRMED`
  - `PENDING -> FAILED`
- A terminal order (`CONFIRMED` or `FAILED`) must not transition back to `PENDING`.

## Implementation Freedom (Intentional)

- Storage schema and migration design are intentionally open.
- Data-access style is intentionally open.
- You may extend the model, read model, or API shape if needed to support your implementation or UI.
- Candidate choices should preserve the core model and invariants, and clearly document trade-offs and extensions in `DECISIONS.md`.
