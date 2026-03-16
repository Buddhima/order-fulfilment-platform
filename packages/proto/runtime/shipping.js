import * as grpc from "@grpc/grpc-js";

import { ShippingQuoteServiceClient } from "../build/shipping/v1/shipping_grpc_pb.js";
import { GetQuoteRequest } from "../build/shipping/v1/shipping_pb.js";

export function createShippingClient(address) {
  const client = new ShippingQuoteServiceClient(
    address,
    grpc.credentials.createInsecure()
  );

  return {
    /**
     * Get shipping quote
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async getQuote(data) {
      const req = new GetQuoteRequest();

      if (data.order_id) req.setOrderId(data.order_id);
      if (data.destination_postal_code) req.setDestinationPostalCode(data.destination_postal_code);
      if (data.item_count != null) req.setItemCount(data.item_count);
      if (data.total_quantity != null) req.setTotalQuantity(data.total_quantity);

      return new Promise((resolve, reject) => {
        client.getQuote(req, (err, res) => {
          if (err) return reject(err);

          resolve({
            available: res.getAvailable(),
            amount: res.getAmount(),
            currency: res.getCurrency(),
            reason: res.getReason(),
          });
        });
      });
    },
  };
}