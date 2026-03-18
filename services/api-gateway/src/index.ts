import "dotenv/config";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import env from "env-var";
import express from "express";
import typeDefs from "./schema/typeDefs";
import resolvers from "./resolvers/orderResolvers";

import type { GraphQLContext } from "./types/context";

import { registerHealthRoute } from "./health";

import type { RuntimeConfig } from "./types/runtimeConfig"
import { createOrderService } from "./modules/order";

// Left the comment below intentionally for the examiner 
// interface RuntimeConfig {
//   port: number;
//   corsOrigin: string;
//   dbHost: string;
//   dbPort: number;
//   dbName: string;
//   dbUser: string;
//   dbPassword: string;
//   inventoryServiceAddress: string;
//   shippingServiceAddress: string;
//   fraudServiceAddress: string;
// }

export function readConfig(): RuntimeConfig {
  return {
    port: env.get("PORT").default("4000").asPortNumber(),
    corsOrigin: env.get("CORS_ORIGIN").default("http://localhost:5173").asString(),
    dbHost: env.get("DB_HOST").default("mariadb").asString(),
    dbPort: env.get("DB_PORT").default("3306").asPortNumber(),
    dbName: env.get("DB_NAME").default("fulfilment").asString(),
    dbUser: env.get("DB_USER").default("app").asString(),
    dbPassword: env.get("DB_PASSWORD").default("app_password").asString(),
    inventoryServiceAddress: env
      .get("INVENTORY_SERVICE_ADDRESS")
      .default("mock-inventory:50051")
      .asString(),
    shippingServiceAddress: env
      .get("SHIPPING_SERVICE_ADDRESS")
      .default("mock-shipping:50052")
      .asString(),
    fraudServiceAddress: env
      .get("FRAUD_SERVICE_ADDRESS")
      .default("mock-fraud:50053")
      .asString(),
  };
}

export async function createApp(): Promise<express.Express> {
  const app = express();
  const runtimeConfig = readConfig();

  const orderService = createOrderService(runtimeConfig);

  registerHealthRoute(app);

  // Initiating Apollo server with GraphQLContext
  const apolloServer = new ApolloServer<GraphQLContext>({
    // Candidate note: Apollo is intentionally provided, but the GraphQL shape is not.
    // Replace this placeholder schema with the approach that fits your design:
    // SDL-first, code-first, schema composition, resolver layout, context wiring, etc.
    // The same applies to the rest of `api-gateway`: choose your own internal module
    // boundaries for persistence, workflow orchestration, and GraphQL integration.
    // Generated gRPC stubs are prepackaged in `@assessment/proto`; decide where to own
    // client construction, reuse, timeouts, and error mapping inside your structure.
    typeDefs,
    resolvers,
  });

  await apolloServer.start();   

  app.use(
    "/graphql",
    cors({
      origin: runtimeConfig.corsOrigin,
    }),
    express.json(),

    expressMiddleware(apolloServer, {
      context: async (): Promise<GraphQLContext> => ({
        orderService
      }),
    }),
  );

  app.get("/", (_request, response) => {
    response.redirect("/graphql");
  });

  return app;
}

export async function startServer(): Promise<void> {
  const runtimeConfig = readConfig();
  const app = await createApp();

  app.listen(runtimeConfig.port, () => {
    console.log(
      `[api-gateway] listening on port ${runtimeConfig.port} with dependencies ${runtimeConfig.inventoryServiceAddress}, ${runtimeConfig.shippingServiceAddress}, ${runtimeConfig.fraudServiceAddress}`,
    );
  });
}

if (require.main === module) {
  void startServer();
}
