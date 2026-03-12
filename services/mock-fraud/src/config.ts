import "dotenv/config";

import env from "env-var";

export type FraudErrorMode = "none" | "unavailable" | "grpc_unavailable";

export interface FraudConfig {
  grpcBindAddress: string;
  errorMode: FraudErrorMode;
}

export function readConfig(): FraudConfig {
  const errorMode = env.get("FRAUD_ERROR_MODE").default("none").asString();

  if (errorMode !== "none" && errorMode !== "unavailable" && errorMode !== "grpc_unavailable") {
    throw new Error(`Invalid FRAUD_ERROR_MODE: ${errorMode}`);
  }

  return {
    grpcBindAddress: env.get("GRPC_BIND_ADDRESS").default("0.0.0.0:50053").asString(),
    errorMode,
  };
}
