import type { OrderRepository } from "../repositories/orderRepository";

import type { InventoryServiceClient } from "@assessment/proto/build/inventory/v1/inventory_grpc_pb";
import type { FraudScoreServiceClient } from "@assessment/proto/build/fraud/v1/fraud_grpc_pb";
import type { ShippingQuoteServiceClient } from "@assessment/proto/build/shipping/v1/shipping_grpc_pb";


export interface GraphQLContext {
  repos: {
    order: OrderRepository;
    // Add other repos here as you grow
  };
  clients: {
    inventory: InventoryServiceClient;
    fraud: FraudScoreServiceClient;
    shipping: ShippingQuoteServiceClient;
  }
}