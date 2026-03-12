import * as grpc from "@grpc/grpc-js";
import { createServiceError } from "@assessment/proto/runtime/grpc";

import type { FraudConfig } from "../../config";

export interface ScoreOrderRequest {
  orderId: string;
  customerIdentifier: string;
  totalQuantity: number;
}

export interface ScoreOrderResponse {
  score: number;
  blocked: boolean;
  reason?: string;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 100000;
  }
  return hash;
}

export async function scoreOrder(
  request: ScoreOrderRequest,
  config: Pick<FraudConfig, "errorMode">,
): Promise<ScoreOrderResponse> {
  if (config.errorMode === "unavailable") {
    return {
      score: 0,
      blocked: true,
      reason: "Fraud scoring unavailable",
    };
  }

  if (config.errorMode === "grpc_unavailable") {
    throw createServiceError(grpc.status.UNAVAILABLE, "Fraud scoring service temporarily unavailable");
  }

  const score = (stableHash(`${request.orderId}:${request.customerIdentifier}`) + request.totalQuantity * 3) % 100;

  return {
    score,
    blocked: score >= 85,
    reason: score >= 85 ? "Fraud threshold exceeded" : undefined,
  };
}
