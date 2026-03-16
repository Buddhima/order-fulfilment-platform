import * as grpc from "@grpc/grpc-js";

import { FraudScoreServiceClient } from "../build/fraud/v1/fraud_grpc_pb.js";
import { ScoreOrderRequest } from "../build/fraud/v1/fraud_pb.js";

export function createFraudClient(address) {
  const client = new FraudScoreServiceClient(
    address,
    grpc.credentials.createInsecure()
  );

  return {
    /**
     * Score an order
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async scoreOrder(data) {
      const req = new ScoreOrderRequest();

      if (data.order_id) req.setOrderId(data.order_id);
      if (data.customer_identifier) req.setCustomerIdentifier(data.customer_identifier);
      if (data.total_quantity != null) req.setTotalQuantity(data.total_quantity);

      return new Promise((resolve, reject) => {
        client.scoreOrder(req, (err, res) => {
          if (err) return reject(err);

          resolve({
            score: res.getScore(),
            blocked: res.getBlocked(),
            reason: res.getReason(),
          });
        });
      });
    },
  };
}