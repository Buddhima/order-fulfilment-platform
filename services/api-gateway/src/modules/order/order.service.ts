import type { OrderRepository } from "../../repositories/order.repository";
import type { ValidatorService } from "./validator.service";

import { ORDER_EVENTS } from "../../constants/order-event.constants";
import { ORDER_STATUS } from "../../constants/order-status.constants";


export class OrderService {

    private validatorService: ValidatorService;
    private orderRepository: OrderRepository;


    constructor(validatorService: ValidatorService, orderRepository: OrderRepository) {
        this.validatorService = validatorService;
        this.orderRepository = orderRepository;
    }

    async getOrders(status: string | undefined) {
        if (!status) {
            return this.orderRepository.getOrders();
        } else {
            return this.orderRepository.getOrdersByStatus(status);
        }
    }

    async getOrderById(id: number | string): Promise<any> {
        return this.orderRepository.getOrderById(id);
    }

    async getOrderEventsByOrderId(id: number | string): Promise<any> {
        return this.orderRepository.getOrderEvents(id);
    }

    async createOrder(order: any) {
        const { customerIdentifier, destinationPostalCode, items } = order;

        // Validate item
        if (!customerIdentifier?.trim()) throw new Error("customerIdentifier is required");
        if (!Array.isArray(items) || items.length === 0) throw new Error("At least one order item is required");

        // Validate order-items
        for (const it of items) {
            if (!it.sku?.trim()) throw new Error("Item sku is required");
            if (!Number.isInteger(it.quantity) || it.quantity <= 0)
                throw new Error("Item quantity must be a positive integer");
        }

        // Add order to database table
        const newOrder = await this.orderRepository.createOrder(order);

        const now = new Date().toISOString();

        return { ...newOrder, status: ORDER_STATUS.PENDING, createdAt: now, updatedAt: now };
    }

    async confirmOrder(id: number | string) {
        const db = this.orderRepository;
        const order = await db.getOrderById(id);

        // Validate order exists
        if (!order) {
            throw new Error("Order not found");
        }

        // Validate order status
        if (order.status != ORDER_STATUS.PENDING) {
            throw new Error("Order status is not PENDING");
        }

        const orderId = id;

        await db.recordOrderEvent(orderId, ORDER_EVENTS.CONFIRMATION_STARTED);

        // const processOrderResult = await processOrder(order, ctx.clients, db);
        const processOrderResult = await this.validatorService.validate(order, db);

        let orderStatus = ""

        if (processOrderResult.success) {
            await db.confirmOrder(orderId, processOrderResult.fraudScore, processOrderResult.shippingAmount);
            await db.recordOrderEvent(orderId, ORDER_EVENTS.ORDER_CONFIRMED);
            orderStatus = ORDER_STATUS.CONFIRMED;

        } else {
            await db.recordOrderEvent(orderId, ORDER_EVENTS.ORDER_FAILED);
            orderStatus = ORDER_STATUS.FAILED;
        }

        // Reduce load on db
        order.status = orderStatus;

        return order;
    }
}