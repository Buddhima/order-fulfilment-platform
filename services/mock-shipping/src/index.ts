import * as grpc from "@grpc/grpc-js";
import {
  ShippingQuoteServiceService,
  type IShippingQuoteServiceServer,
} from "@assessment/proto/build/shipping/v1/shipping_grpc_pb";
import {
  bindGrpcServer,
  handleUnary,
  type StartedGrpcService,
} from "@assessment/proto/runtime/grpc";
import {
  GetQuoteResponse as GetQuoteResponseMessage,
} from "@assessment/proto/build/shipping/v1/shipping_pb";

import { readConfig } from "./config";
import { getQuote } from "./grpc/handlers/getQuote";

export type StartedShippingService = StartedGrpcService;

function toGetQuoteResponseMessage(response: Awaited<ReturnType<typeof getQuote>>): GetQuoteResponseMessage {
  const message = new GetQuoteResponseMessage();
  message.setAvailable(response.available);
  message.setAmount(response.amount);
  message.setCurrency(response.currency);

  if (response.reason) {
    message.setReason(response.reason);
  }

  return message;
}

export async function startService(config = readConfig()): Promise<StartedShippingService> {
  const server = new grpc.Server();
  const implementation: IShippingQuoteServiceServer = {
    getQuote: handleUnary(
      (request) => ({
        orderId: request.getOrderId(),
        destinationPostalCode: request.getDestinationPostalCode() || undefined,
        itemCount: request.getItemCount(),
        totalQuantity: request.getTotalQuantity(),
      }),
      (input) =>
        getQuote(input, {
          latencyMs: config.latencyMs,
          errorMode: config.errorMode,
        }),
      toGetQuoteResponseMessage,
      "Shipping service error",
    ),
  };

  server.addService(ShippingQuoteServiceService, implementation);
  return bindGrpcServer(server, config.grpcBindAddress, "mock-shipping");
}

if (require.main === module) {
  void startService();
}
