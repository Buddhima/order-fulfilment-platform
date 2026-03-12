import * as grpc from "@grpc/grpc-js";
import {
  InventoryServiceService,
  type IInventoryServiceServer,
} from "@assessment/proto/build/inventory/v1/inventory_grpc_pb";
import {
  bindGrpcServer,
  handleUnary,
  type StartedGrpcService,
} from "@assessment/proto/runtime/grpc";
import {
  ReserveItem as ReserveItemMessage,
  ReserveItemsResponse as ReserveItemsResponseMessage,
  ReserveResult as ReserveResultMessage,
} from "@assessment/proto/build/inventory/v1/inventory_pb";

import { readConfig } from "./config";
import { reserveItems } from "./grpc/handlers/reserveItems";

export type StartedInventoryService = StartedGrpcService;

function toReserveItemsResponseMessage(response: ReturnType<typeof reserveItems>): ReserveItemsResponseMessage {
  const message = new ReserveItemsResponseMessage();
  message.setReserved(response.reserved);

  if (response.reason) {
    message.setReason(response.reason);
  }

  message.setResultsList(
    response.results.map((result) => {
      const resultMessage = new ReserveResultMessage();
      resultMessage.setSku(result.sku);
      resultMessage.setRequestedQuantity(result.requestedQuantity);
      resultMessage.setRemainingQuantity(result.remainingQuantity);
      resultMessage.setReserved(result.reserved);
      return resultMessage;
    }),
  );

  return message;
}

export async function startService(config = readConfig()): Promise<StartedInventoryService> {
  const server = new grpc.Server();
  const implementation: IInventoryServiceServer = {
    reserveItems: handleUnary(
      (request) => ({
        orderId: request.getOrderId(),
        items: request.getItemsList().map((item: ReserveItemMessage) => ({
          sku: item.getSku(),
          quantity: item.getQuantity(),
        })),
      }),
      reserveItems,
      toReserveItemsResponseMessage,
      "Inventory service error",
    ),
  };

  server.addService(InventoryServiceService, implementation);
  return bindGrpcServer(server, config.grpcBindAddress, "mock-inventory");
}

if (require.main === module) {
  void startService();
}
