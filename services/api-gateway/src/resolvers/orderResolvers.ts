import type { GraphQLContext } from "../types/context";

const resolvers = {
    Query: {

        orders: async (_, { status }, ctx: GraphQLContext) => {

            const db_orders = await ctx.repos.order.getOrders();
            if (!status) {
                return db_orders;
            }

            return db_orders.filter(order => order.status === status);
        },

        order: async (_, { id }, ctx: GraphQLContext) => {
            return await ctx.repos.order.getOrderById(id);
        }

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

            return {...newOrder, status: 'PENDING', createdAt: now, updatedAt: now}; // TODO: fix by updating model

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

            // TODO: call external services

            await ctx.repos.order.confirmOrder(id, null, null);
            order.status = "CONFIRMED";

            return order;
        }

    }
};

export default resolvers;
