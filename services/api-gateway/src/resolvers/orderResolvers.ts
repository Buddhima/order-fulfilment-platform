const orders = require("../data/mockOrders");

const resolvers = {
    Query: {

        orders: (_, { status }) => {
            if (!status) {
                return orders;
            }

            return orders.filter(order => order.status === status);
        },

        order: (_, { id }) => {
            return orders.find(order => order.id === id);
        }

    },

    Mutation: {

        createOrder: (_, { input }) => {

            const { customerIdentifier, destinationPostalCode, items } = input;

            if (!customerIdentifier?.trim()) throw new Error("customerIdentifier is required");
            if (!Array.isArray(items) || items.length === 0) throw new Error("At least one order item is required");


            for (const it of items) {
                if (!it.sku?.trim()) throw new Error("Item sku is required");
                if (!Number.isInteger(it.quantity) || it.quantity <= 0)
                    throw new Error("Item quantity must be a positive integer");
            }

            const now = new Date().toISOString();

            const newOrder = {
                id: "5",
                customerIdentifier: customerIdentifier.trim(),
                destinationPostalCode: destinationPostalCode ?? null,
                status: "PENDING",
                items: items.map(i => ({ sku: i.sku.trim(), quantity: i.quantity })),
                fraudScore: null,
                shippingAmount: null,
                latestError: null,
                createdAt: now,
                updatedAt: now,
            };

            orders.push(newOrder);
            return newOrder;

        },

        confirmOrder: (_, { id }) => {

            const order = orders.find(o => o.id === id);

            if (!order) {
                throw new Error("Order not found");
            }

            if (order.status != "PENDING") {
                throw new Error("Order status is not PENDING");
            }

            order.status = "CONFIRMED";

            return order;
        }

    }
};

export default resolvers;
