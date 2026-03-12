import * as grpc from "@grpc/grpc-js";
import {
  FraudScoreServiceService,
  type IFraudScoreServiceServer,
} from "@assessment/proto/build/fraud/v1/fraud_grpc_pb";
import {
  bindGrpcServer,
  handleUnary,
  type StartedGrpcService,
} from "@assessment/proto/runtime/grpc";
import {
  ScoreOrderResponse as ScoreOrderResponseMessage,
} from "@assessment/proto/build/fraud/v1/fraud_pb";

import { readConfig } from "./config";
import { scoreOrder } from "./grpc/handlers/scoreOrder";

export type StartedFraudService = StartedGrpcService;

function toScoreOrderResponseMessage(response: Awaited<ReturnType<typeof scoreOrder>>): ScoreOrderResponseMessage {
  const message = new ScoreOrderResponseMessage();
  message.setScore(response.score);
  message.setBlocked(response.blocked);

  if (response.reason) {
    message.setReason(response.reason);
  }

  return message;
}

export async function startService(config = readConfig()): Promise<StartedFraudService> {
  const server = new grpc.Server();
  const implementation: IFraudScoreServiceServer = {
    scoreOrder: handleUnary(
      (request) => ({
        orderId: request.getOrderId(),
        customerIdentifier: request.getCustomerIdentifier(),
        totalQuantity: request.getTotalQuantity(),
      }),
      (input) =>
        scoreOrder(input, {
          errorMode: config.errorMode,
        }),
      toScoreOrderResponseMessage,
      "Fraud service error",
    ),
  };

  server.addService(FraudScoreServiceService, implementation);
  return bindGrpcServer(server, config.grpcBindAddress, "mock-fraud");
}

if (require.main === module) {
  void startService();
}
