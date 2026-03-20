import { OrderService } from "../modules/order/order.service";

export interface GraphQLContext {
  orderService: OrderService;
}