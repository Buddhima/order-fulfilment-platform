import type { GraphQLContext } from "../types/context";
import { ORDER_EVENTS } from "../constants/orderEvents";
import { ORDER_STATUS } from "../constants/orderStatus";

async function reserveInventory(client: any, order_id: string, items: any[]) {
    return await client.reserveItems({
        order_id,
        items
    });
}

async function scoreOrder(client: any, order_id: string, customer_identifier: string, total_quantity: string) {
    return await client.scoreOrder({
        order_id,
        customer_identifier,
        total_quantity
    });
}

async function getQuote(client: any, order_id: string, destination_postal_code: string, item_count: number, total_quantity: number) {
    return await client.getQuote({
        order_id,
        destination_postal_code,
        item_count,
        total_quantity
    })
}

async function processOrder(order, clients, db) {

    const { inventory, fraud, shipping } = clients;

    // number of items
    const numberOfItems = order.items.length;

    // total quantity
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    // results from the services
    const resultData = {
        fraudScore: null,
        shippingAmount: null
    };

    const orderId = order.id;

    // handler when backend response is failure
    const handleServiceFailure = async (status, error) => {
        await db.recordOrderEvent(orderId, status, error);
        await db.failOrder(orderId, status);
    };

    // handler when the service is failing
    const handleServiceError = async (status, error) => {
        await db.recordOrderEvent(orderId, status, error);
        await db.failOrder(orderId, status);
    };

    const services = [
        {
            name: "inventory",
            call: () => reserveInventory(inventory, order.orderId, order.items),
            interpret: (res) => res.reserved === true,
            onSuccess: async (res) => {
                await db.recordOrderEvent(orderId, ORDER_EVENTS.INVENTORY_RESERVATION_SUCCESS);
            },
            onFailure: async (res) => await handleServiceFailure(ORDER_EVENTS.INVENTORY_RESERVATION_FAILED, res),
            onError: async (error) => await handleServiceError(ORDER_EVENTS.INVENTORY_RESERVATION_ERROR, error),
        },
        {
            name: "fraud",
            call: () => scoreOrder(
                fraud,
                order.orderId,
                order.customerIdentifier,
                totalQuantity
            ),
            interpret: (res) => res.blocked === false,
            onSuccess: async (res) => {
                resultData.fraudScore = res.score;
                await db.recordOrderEvent(orderId, ORDER_EVENTS.ORDER_SCORING_SUCCESS);
            },
            onFailure: async (res) => await handleServiceFailure(ORDER_EVENTS.ORDER_SCORING_FAILED, res),
            onError: async (error) => await handleServiceError(ORDER_EVENTS.ORDER_SCORING_ERROR, error),
        },
        {
            name: "shipping",
            call: () => getQuote(
                shipping,
                order.orderId,
                order.destinationPostalCode,
                numberOfItems,
                totalQuantity
            ),
            interpret: (res) => res.available == true,
            onSuccess: async (res) => {
                resultData.shippingAmount = res.amount;
                await db.recordOrderEvent(orderId, ORDER_EVENTS.SHIPPING_QUOTE_SUCCESS);
            },
            onFailure: async (res) => await handleServiceFailure(ORDER_EVENTS.SHIPPING_QUOTE_FAILED, res),
            onError: async (error) => await handleServiceError(ORDER_EVENTS.SHIPPING_QUOTE_ERROR, error),
        }
    ];

    // Execute the services
    const results = await Promise.all(
        services.map(async (svc) => {
            try {
                const response = await svc.call();
                const success = svc.interpret(response);

                if (success)
                    svc.onSuccess(response);
                else
                    svc.onFailure(response);

                return success;

            } catch (err) {
                svc.onError(err);

                return false;
            }
        })
    );

    const anyFailed = results.some(r => !r);

    return {
        success: !anyFailed,
        fraudScore: resultData.fraudScore,
        shippingAmount: resultData.shippingAmount
    };
}


const resolvers = {
    Query: {

        orders: async (_, { status }, ctx: GraphQLContext) => {

            if (!status) {
                const orders = await ctx.repos.order.getOrders();
                return orders;
            } else {
                return await ctx.repos.order.getOrdersByStatus(status);
            }

            // return orders.filter(order => order.status === status);
        },

        order: async (_, { id }, ctx: GraphQLContext) => {
            return await ctx.repos.order.getOrderById(id);
        },

        orderEvents: async (_, { id }, ctx: GraphQLContext) => {
            return await ctx.repos.order.getOrderEvents(id);
        },

    },

    Mutation: {

        createOrder: async (_, { input }, ctx: GraphQLContext) => {

            const { customerIdentifier, destinationPostalCode, items } = input;

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
            const newOrder = await ctx.repos.order.createOrder(input);

            const now = new Date().toISOString();

            return { ...newOrder, status: ORDER_STATUS.PENDING, createdAt: now, updatedAt: now };

        },

        confirmOrder: async (_, { id }, ctx: GraphQLContext) => {

            const db = ctx.repos.order;
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

            const processOrderResult = await processOrder(order, ctx.clients, db);

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
};

export default resolvers;
