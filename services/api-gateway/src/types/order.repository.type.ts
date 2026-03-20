import {
    Order,
    OrderEvent
} from "./order.resolver.types";

export interface IOrderRepository {

  createOrder(order: any): Promise<Order>;
  getOrderById(id: number): Promise<Order | null>;
  getOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  confirmOrder(id: number, fraudScore: number, shippingAmount: number): Promise<void>;
  failOrder(id: number, error: string): Promise<void>;
  recordOrderEvent(orderId: number, eventType: string, eventData?: any): Promise<void>;
  getOrderEvents(orderId: number): Promise<OrderEvent[]>;

}
