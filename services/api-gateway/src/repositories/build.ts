import { OrderRepository } from "./orderRepository";
import { RuntimeConfig } from "../types/runtimeConfig";
import mysql, { type Pool } from "mysql2/promise";

// Function to generate db connection pool
function createPool(cfg: RuntimeConfig): Pool {
  return mysql.createPool({
    host: cfg.dbHost,
    port: cfg.dbPort,
    user: cfg.dbUser,
    password: cfg.dbPassword,
    database: cfg.dbName,
    connectionLimit: 10,
  });
}

export function buildRepositories(cfg: RuntimeConfig) {
  const pool = createPool(cfg);

  return {
    order: new OrderRepository(pool),
    // add more repos here
  };
}

export type Repositories = ReturnType<typeof buildRepositories>;
