import * as grpc from "@grpc/grpc-js";
import { createServiceError } from "@assessment/proto/runtime/grpc";

import type { ShippingConfig } from "../../config";

export interface GetQuoteRequest {
  orderId: string;
  destinationPostalCode?: string;
  itemCount: number;
  totalQuantity: number;
}

export interface GetQuoteResponse {
  available: boolean;
  amount: number;
  currency: "NZD";
  reason?: string;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function postalFactor(postalCode: string | undefined): number {
  if (!postalCode) {
    return 0;
  }

  const digits = postalCode
    .split("")
    .filter((character) => Number.isInteger(Number.parseInt(character, 10)))
    .map((character) => Number.parseInt(character, 10));

  return digits.reduce((sum, value) => sum + value, 0) % 5;
}

export async function getQuote(
  request: GetQuoteRequest,
  config: Pick<ShippingConfig, "latencyMs" | "errorMode">,
): Promise<GetQuoteResponse> {
  if (config.latencyMs > 0) {
    await delay(config.latencyMs);
  }

  if (config.errorMode === "unavailable") {
    return {
      available: false,
      amount: 0,
      currency: "NZD",
      reason: "Shipping provider temporarily unavailable",
    };
  }

  if (config.errorMode === "grpc_unavailable") {
    throw createServiceError(grpc.status.UNAVAILABLE, "Shipping service temporarily unavailable");
  }

  const amount = Number(
    (7.5 + request.totalQuantity * 1.25 + request.itemCount * 0.5 + postalFactor(request.destinationPostalCode)).toFixed(
      2,
    ),
  );

  return {
    available: true,
    amount,
    currency: "NZD",
  };
}
