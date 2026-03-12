import "dotenv/config";

import env from "env-var";

export type ShippingErrorMode = "none" | "unavailable" | "grpc_unavailable";

export interface ShippingConfig {
  grpcBindAddress: string;
  latencyMs: number;
  errorMode: ShippingErrorMode;
}

export function readConfig(): ShippingConfig {
  const errorMode = env.get("SHIPPING_ERROR_MODE").default("none").asString();

  if (errorMode !== "none" && errorMode !== "unavailable" && errorMode !== "grpc_unavailable") {
    throw new Error(`Invalid SHIPPING_ERROR_MODE: ${errorMode}`);
  }

  return {
    grpcBindAddress: env.get("GRPC_BIND_ADDRESS").default("0.0.0.0:50052").asString(),
    latencyMs: Math.max(env.get("SHIPPING_LATENCY_MS").default("0").asInt(), 0),
    errorMode,
  };
}
