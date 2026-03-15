// src/types/context.ts
import type { Pool } from "mysql2/promise";
import type { OrderRepository } from "../repositories/orderRepository";

export interface GraphQLContext {
  db: Pool;
  repos: {
    order: OrderRepository;
    // TODO: add other repos here as you grow
  };
}