import { reserveItems, resetInventory } from "../src/grpc/handlers/reserveItems";

describe("reserveItems", () => {
  beforeEach(() => {
    resetInventory();
  });

  it("reserves inventory when stock is available", () => {
    const response = reserveItems({
      orderId: "order-1",
      items: [{ sku: "SKU-BLUE-LAMP", quantity: 2 }],
    });

    expect(response.reserved).toBe(true);
    expect(response.results[0]?.remainingQuantity).toBe(10);
  });

  it("fails when sku is unknown", () => {
    const response = reserveItems({
      orderId: "order-2",
      items: [{ sku: "SKU-UNKNOWN", quantity: 1 }],
    });

    expect(response.reserved).toBe(false);
    expect(response.reason).toBe("Insufficient inventory");
  });
});
