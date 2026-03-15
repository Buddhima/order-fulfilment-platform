import type { GraphQLContext } from "../types/context";

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

            return { ...newOrder, status: 'PENDING', createdAt: now, updatedAt: now }; // TODO: fix by updating model

        },

        confirmOrder: async (_, { id }, ctx: GraphQLContext) => {

            const order = await ctx.repos.order.getOrderById(id);

            // Validate order exists
            if (!order) {
                throw new Error("Order not found");
            }


            // Validate order status
            if (order.status != "PENDING") {
                throw new Error("Order status is not PENDING");
            }

            const orderId = id;

            await ctx.repos.order.recordOrderEvent(orderId, "CONFIRMATION_STARTED");

            try {

                // Calling fraud service

                // TODO: call external services
                await ctx.repos.order.recordOrderEvent(orderId, "FRAUD_CHECK_COMPLETED", {
                    fraudScore: 23
                });

            } catch (err) {
                // to handle transport failures
                await ctx.repos.order.recordOrderEvent(orderId, "ORDER_FAILED", {
                    reason: "Fraud score exceeded threshold"
                });

                return false;
            }


            try {

                // Calling shipping service

                await ctx.repos.order.recordOrderEvent(orderId, "SHIPPING_QUOTE_RECEIVED", {
                    shippingAmount: 14.50,
                    provider: "DHL"
                });

            } catch (err) {
                // to handle transport failures
                await ctx.repos.order.recordOrderEvent(orderId, "ORDER_FAILED", {
                    reason: "Shipping is quote not available"
                });

                return false;
            }


            await ctx.repos.order.confirmOrder(id, null, null);
            order.status = "CONFIRMED";

            await ctx.repos.order.recordOrderEvent(orderId, "ORDER_CONFIRMED");

            return order;

        }

    }
};

export default resolvers;
