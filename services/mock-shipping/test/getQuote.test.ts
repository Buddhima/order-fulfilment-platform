import * as grpc from "@grpc/grpc-js";
import { ShippingQuoteServiceClient } from "@assessment/proto/build/shipping/v1/shipping_grpc_pb";
import { GetQuoteRequest } from "@assessment/proto/build/shipping/v1/shipping_pb";

import { startService } from "../src/index";
import { getQuote } from "../src/grpc/handlers/getQuote";

describe("getQuote", () => {
  it("returns a deterministic quote", async () => {
    const response = await getQuote(
      {
        orderId: "order-1",
        destinationPostalCode: "6011",
        itemCount: 2,
        totalQuantity: 3,
      },
      {
        latencyMs: 0,
        errorMode: "none",
      },
    );

    expect(response.available).toBe(true);
    expect(response.currency).toBe("NZD");
    expect(response.amount).toBeGreaterThan(0);
  });

  it("returns unavailable when configured", async () => {
    const response = await getQuote(
      {
        orderId: "order-2",
        destinationPostalCode: "6021",
        itemCount: 1,
        totalQuantity: 1,
      },
      {
        latencyMs: 0,
        errorMode: "unavailable",
      },
    );

    expect(response.available).toBe(false);
    expect(response.reason).toContain("temporarily unavailable");
  });

  it("returns grpc unavailable when configured", async () => {
    const startedService = await startService({
      grpcBindAddress: "127.0.0.1:0",
      latencyMs: 0,
      errorMode: "grpc_unavailable",
    });

    const client = new ShippingQuoteServiceClient(
      `127.0.0.1:${startedService.port}`,
      grpc.credentials.createInsecure(),
    );

    const request = new GetQuoteRequest();
    request.setOrderId("order-grpc-error");
    request.setDestinationPostalCode("6011");
    request.setItemCount(1);
    request.setTotalQuantity(1);

    try {
      await expect(
        new Promise<void>((resolve, reject) => {
          client.getQuote(request, (error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        }),
      ).rejects.toMatchObject({
        code: grpc.status.UNAVAILABLE,
        details: "Shipping service temporarily unavailable",
      });
    } finally {
      client.close();
      startedService.server.forceShutdown();
    }
  });

  it("serves gRPC calls through the generated client", async () => {
    const startedService = await startService({
      grpcBindAddress: "127.0.0.1:0",
      latencyMs: 0,
      errorMode: "none",
    });

    const client = new ShippingQuoteServiceClient(
      `127.0.0.1:${startedService.port}`,
      grpc.credentials.createInsecure(),
    );

    const request = new GetQuoteRequest();
    request.setOrderId("order-3");
    request.setDestinationPostalCode("6011");
    request.setItemCount(2);
    request.setTotalQuantity(3);

    try {
      await new Promise<void>((resolve, reject) => {
        client.getQuote(request, (error, response) => {
          if (error) {
            reject(error);
            return;
          }

          expect(response).toBeDefined();
          expect(response?.getAvailable()).toBe(true);
          expect(response?.getCurrency()).toBe("NZD");
          expect(response?.getAmount()).toBeGreaterThan(0);
          resolve();
        });
      });
    } finally {
      client.close();
      startedService.server.forceShutdown();
    }
  });
});
