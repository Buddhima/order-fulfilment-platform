import type { Pool } from "mysql2/promise";
import { OrderRepository } from "./orderRepository";

export function buildRepositories(pool: Pool) {
  return {
    order: new OrderRepository(pool),
    // add more repos here
  };
}

export type Repositories = ReturnType<typeof buildRepositories>;
