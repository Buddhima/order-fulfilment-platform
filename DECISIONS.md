# Decisions

Use this file to capture the key choices you made so reviewers can understand your implementation quickly.

## Overview

The implementation was done through multiple phases
1.  Building graphql endpoint
The api-gateway service is a Apollo server based graphql endpoint, that needs to have schema and reolvers. At this stage, based on the model documentation, necessary artifacts were added to `api-gateway/schema/typeDefs.ts` and `api-gateway/resolvers/orderResolvers.ts` . Resolver takes the database repository and service clients via context to serve the client requests .In future any additional resolvers can be placed at `resolvers/`
2. Initiate DB tables
The database table creation scripts adde to `db-scripts\001_create_order_tables.sql` location. This location is refered at maria-db docker `docker-entrypoint-initdb.d`. In future any scripts adding to the location will be executed at db container startup.
3. Connecting to database
The database connectivity is done throu nodejs-24 bundled `mysql2` and avoiiided external ORM dependancies. The initiation of the db connection pool and repository methods are located at `api-gateway/repositories`. The `build.ts` currently initate `OrderRepository` but allowing space to extend. Passing the repository to the resolver is done through the `GraphQLContext`.
4. Connecting to external services
The existing scaffolding install the `@assignment/proto` in to `api-gateway` project. The service client generation is done through `api-gateway/services/init.ts` which find deeplinks to the client stubs and generate functions that are callable via JS objects at resolvers. These are also passed to the resolver is done through the `GraphQLContext`.
5. Building frontend web app
The frontend is a React based app and to make it responsible for screen sizes, Ionic framework is used. The `web-clinet/pages` define pages for listing and create orders. `web-clinet/components` contians `OrderCard` component for displaying the order list. Once user clicks an order, `OrderDetails` page display the order details and only if the order is at `PENDING` state, it allows to confirm the order and view the updated details. Client for calling the graphql endpoint is located at `web-client/api` folder.
6. Test generation
Jest based tests for testing `api-gateway` service is located at `api-gatewa/test/orderWorkflow.test.ts` and can be executed with the current test running script.



## Assumptions For Unspecified Behaviour

- List any behaviour that was not explicitly defined in the starter docs.
- Note the choice you made and why.

1. External service behaviour expect to follow the `.proto` service agreement. Any alternatives to that will impact order confirmation.
2. To make the app suitable for mobile browsers (and for app generation etc.) Ionic framework used.
3. DB scripts were added to `db-scripts` and updating docker-compose to execute them.
4. DB repository was specified to use an ORM framework and sticking with inbuilt `sql2` libraries.
5. Had to use deeplinks to access proto-buffer client stubs and `services/init.ts` used to simplify the method calls.
6. Sample `.env.example` file was not available.
7. Exact order events are not specified. Defining event statuses specified at `api-gateway/constant/orderEvents.ts` Same statuses are used for recording `latestError` field for Orders.

## Model Or Read-Model Extensions

- List any fields, derived views, or API shape changes you added beyond `MODEL.md`.
- Explain why they were needed.

1. `order_events` table created to record the events of order creation, confirmation steps and final state.
2. `updated_at`, `created_at` fields are using `TIMESTAMP` data format.

## Integration And Error-Handling Choices

- Note timeout, retry, error-mapping, and dependency-handling decisions.

1. External service integration located at Resolver. Each service invocation has `onSuccess`, `onFailure` (for negative responses) and `onError` (for transport failures) callbacks to handle possible errors.
2. Using timeout for calling services via protobuf. Currently using 5 second timeout as the `deadline` parameter
3. Error events are written to `order_events` table to trace the events.

## Trade-Offs And Alternatives

- Record the main alternatives you considered and why you did not choose them.

## Known Gaps Or Next Steps

- Note any limitations, unfinished work, or improvements you would make next.
