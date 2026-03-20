import type { GraphQLContext } from "../types/context.type";

import {
    OrdersArgs,
    OrderArgs,
    OrderEventsArgs,
    CreateOrderArgs,
    ConfirmOrderArgs,
} from "../types/order.resolver.types";


const resolvers = {
    Query: {

        orders: async (_: unknown, { status }: OrdersArgs, ctx: GraphQLContext) => {
            return await ctx.orderService.getOrders(status);
        },

        order: async (_: unknown, { id }: OrderArgs, ctx: GraphQLContext) => {
            return await ctx.orderService.getOrderById(id);
        },

        orderEvents: async (_: unknown, { id }: OrderEventsArgs, ctx: GraphQLContext) => {
            return await ctx.orderService.getOrderEventsByOrderId(id);
        },

    },

    Mutation: {

        createOrder: async (_: unknown, { input }: CreateOrderArgs, ctx: GraphQLContext) => {
            return await ctx.orderService.createOrder(input);
        },

        confirmOrder: async (_: unknown, { id }: ConfirmOrderArgs, ctx: GraphQLContext) => {
            return await ctx.orderService.confirmOrder(id);
        }

    }
};

export default resolvers;
