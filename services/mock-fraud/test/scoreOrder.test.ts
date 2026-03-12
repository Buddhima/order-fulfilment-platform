import * as grpc from "@grpc/grpc-js";
import { FraudScoreServiceClient } from "@assessment/proto/build/fraud/v1/fraud_grpc_pb";
import { ScoreOrderRequest } from "@assessment/proto/build/fraud/v1/fraud_pb";

import { startService } from "../src/index";
import { scoreOrder } from "../src/grpc/handlers/scoreOrder";

describe("scoreOrder", () => {
  it("returns deterministic score", async () => {
    const first = await scoreOrder(
      {
        orderId: "order-1",
        customerIdentifier: "customer-a",
        totalQuantity: 2,
      },
      { errorMode: "none" },
    );

    const second = await scoreOrder(
      {
        orderId: "order-1",
        customerIdentifier: "customer-a",
        totalQuantity: 2,
      },
      { errorMode: "none" },
    );

    expect(first.score).toBe(second.score);
  });

  it("returns blocked result when unavailable", async () => {
    const response = await scoreOrder(
      {
        orderId: "order-2",
        customerIdentifier: "customer-b",
        totalQuantity: 1,
      },
      { errorMode: "unavailable" },
    );

    expect(response.blocked).toBe(true);
    expect(response.reason).toBe("Fraud scoring unavailable");
  });

  it("returns grpc unavailable when configured", async () => {
    const startedService = await startService({
      grpcBindAddress: "127.0.0.1:0",
      errorMode: "grpc_unavailable",
    });

    const client = new FraudScoreServiceClient(
      `127.0.0.1:${startedService.port}`,
      grpc.credentials.createInsecure(),
    );

    const request = new ScoreOrderRequest();
    request.setOrderId("order-grpc-error");
    request.setCustomerIdentifier("customer-c");
    request.setTotalQuantity(1);

    try {
      await expect(
        new Promise<void>((resolve, reject) => {
          client.scoreOrder(request, (error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        }),
      ).rejects.toMatchObject({
        code: grpc.status.UNAVAILABLE,
        details: "Fraud scoring service temporarily unavailable",
      });
    } finally {
      client.close();
      startedService.server.forceShutdown();
    }
  });
});
