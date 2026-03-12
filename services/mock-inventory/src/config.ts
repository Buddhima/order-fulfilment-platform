import "dotenv/config";

import env from "env-var";

export interface InventoryConfig {
  grpcBindAddress: string;
}

export function readConfig(): InventoryConfig {
  return {
    grpcBindAddress: env.get("GRPC_BIND_ADDRESS").default("0.0.0.0:50051").asString(),
  };
}
