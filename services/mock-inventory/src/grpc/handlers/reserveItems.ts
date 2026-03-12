import { inventorySeed } from "../../data/inventorySeed";

export interface ReserveItemRequest {
  sku: string;
  quantity: number;
}

export interface ReserveItemsRequest {
  orderId: string;
  items: ReserveItemRequest[];
}

export interface ReserveResult {
  sku: string;
  requestedQuantity: number;
  remainingQuantity: number;
  reserved: boolean;
}

export interface ReserveItemsResponse {
  reserved: boolean;
  reason?: string;
  results: ReserveResult[];
}

const inventory = new Map<string, number>(
  inventorySeed.map((item) => [item.sku, item.availableQuantity]),
);

export function resetInventory(): void {
  inventory.clear();
  for (const item of inventorySeed) {
    inventory.set(item.sku, item.availableQuantity);
  }
}

export function reserveItems(request: ReserveItemsRequest): ReserveItemsResponse {
  if (!request.items.length) {
    return {
      reserved: false,
      reason: "No items supplied",
      results: [],
    };
  }

  const results: ReserveResult[] = [];
  let allReserved = true;

  for (const item of request.items) {
    const availableQuantity = inventory.get(item.sku);

    if (availableQuantity === undefined) {
      allReserved = false;
      results.push({
        sku: item.sku,
        requestedQuantity: item.quantity,
        remainingQuantity: 0,
        reserved: false,
      });
      continue;
    }

    if (item.quantity < availableQuantity) {
      const remainingQuantity = availableQuantity - item.quantity;
      inventory.set(item.sku, remainingQuantity);

      results.push({
        sku: item.sku,
        requestedQuantity: item.quantity,
        remainingQuantity,
        reserved: true,
      });
    } else {
      allReserved = false;
      results.push({
        sku: item.sku,
        requestedQuantity: item.quantity,
        remainingQuantity: availableQuantity,
        reserved: false,
      });
    }
  }

  return {
    reserved: allReserved,
    reason: allReserved ? undefined : "Insufficient inventory",
    results,
  };
}
