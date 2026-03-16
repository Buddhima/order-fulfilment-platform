import * as grpc from "@grpc/grpc-js";
import { InventoryServiceClient } from "../build/inventory/v1/inventory_grpc_pb.js";
import { ReserveItemsRequest, ReserveItem } from "../build/inventory/v1/inventory_pb.js";

/**
 * Create InventoryService client with async/await wrapper
 * @param {string} address - gRPC server address
 */
export function createInventoryClient(address) {
  const client = new InventoryServiceClient(address, grpc.credentials.createInsecure());

  return {
    /**
     * Reserve items
     * @param {Object} data - { order_id: string, items: [{ sku, quantity }] }
     * @returns {Promise<Object>} - resolved response
     */
    async reserveItems(data) {
      const req = new ReserveItemsRequest();
      if (data.order_id) req.setOrderId(data.order_id);

      if (Array.isArray(data.items)) {
        const protoItems = data.items.map(({ sku, quantity }) => {
          const item = new ReserveItem();
          if (sku) item.setSku(sku);
          if (quantity != null) item.setQuantity(quantity);
          return item;
        });
        req.setItemsList(protoItems);
      }

      return new Promise((resolve, reject) => {
        client.reserveItems(req, (err, res) => {
          if (err) return reject(err);

          const results = res.getResultsList().map(r => ({
            sku: r.getSku(),
            requested_quantity: r.getRequestedQuantity(),
            remaining_quantity: r.getRemainingQuantity(),
            reserved: r.getReserved(),
          }));

          resolve({
            reserved: res.getReserved(),
            reason: res.getReason(),
            results,
          });
        });
      });
    },
  };
}