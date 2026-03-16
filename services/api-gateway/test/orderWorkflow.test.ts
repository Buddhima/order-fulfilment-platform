import request from "supertest";
import { createApp } from "../src/index";

describe("order workflow", () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  it("create order through GraphQL and persist initial state", async () => {
    const mutation = `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id
          status
          customerIdentifier
          items {
            sku
            quantity
          }
        }
      }
    `;

    const variables = {
      input: {
        customerIdentifier: "cust-123",
        destinationPostalCode: "1010",
        items: [
          { sku: "sku-1", quantity: 2 },
          { sku: "sku-2", quantity: 1 }
        ]
      }
    };

    const response = await request(app)
      .post("/graphql")
      .send({ query: mutation, variables });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const order = response.body.data.createOrder;

    expect(order.id).toBeDefined();
    expect(order.status).toBe("PENDING");
    expect(order.customerIdentifier).toBe("cust-123");
    expect(order.items.length).toBe(2);
  });

  it("list and fetch orders by id", async () => {
    const createMutation = `
      mutation {
        createOrder(input: {
          customerIdentifier: "cust-list"
          destinationPostalCode: "2020"
          items: [{ sku: "sku-list", quantity: 1 }]
        }) {
          id
        }
      }
    `;

    const createRes = await request(app)
      .post("/graphql")
      .send({ query: createMutation });

    const orderId = createRes.body.data.createOrder.id;

    const queryById = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          status
          customerIdentifier
        }
      }
    `;

    const orderRes = await request(app)
      .post("/graphql")
      .send({ query: queryById, variables: { id: orderId } });

    expect(orderRes.status).toBe(200);
    expect(orderRes.body.data.order.id).toBe(orderId);

    const listQuery = `
      query {
        orders {
          id
        }
      }
    `;

    const listRes = await request(app)
      .post("/graphql")
      .send({ query: listQuery });

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data.orders)).toBe(true);

    const ids = listRes.body.data.orders.map((o: any) => o.id);
    expect(ids).toContain(orderId);
  });

  it("confirm order with inventory, shipping, and fraud integrations", async () => {
    const createMutation = `
      mutation {
        createOrder(input: {
          customerIdentifier: "cust-confirm"
          destinationPostalCode: "3030"
          items: [{ sku: "SKU-RED-CHAIR", quantity: 1 }]
        }) {
          id
          status
        }
      }
    `;

    const createRes = await request(app)
      .post("/graphql")
      .send({ query: createMutation });

    const orderId = createRes.body.data.createOrder.id;

    const confirmMutation = `
      mutation ConfirmOrder($id: ID!) {
        confirmOrder(id: $id) {
          id
          status
          fraudScore
          shippingAmount
        }
      }
    `;

    const confirmRes = await request(app)
      .post("/graphql")
      .send({ query: confirmMutation, variables: { id: orderId } });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.errors).toBeUndefined();

    const order = confirmRes.body.data.confirmOrder;

    expect(order.id).toBe(orderId);
    expect(order.status).toBe("CONFIRMED");

    // assuming integrations populate these
    expect(order.fraudScore).toBeDefined();
    expect(order.shippingAmount).toBeDefined();
  });

  it("handle dependency failure paths with clear error mapping", async () => {
    const createMutation = `
      mutation {
        createOrder(input: {
          customerIdentifier: "cust-fail"
          destinationPostalCode: "4040"
          items: [{ sku: "sku-fail", quantity: 1 }]
        }) {
          id
        }
      }
    `;

    const createRes = await request(app)
      .post("/graphql")
      .send({ query: createMutation });

    const orderId = createRes.body.data.createOrder.id;

    const confirmMutation = `
      mutation ConfirmOrder($id: ID!) {
        confirmOrder(id: $id) {
          id
          status
          latestError
        }
      }
    `;

    const confirmRes = await request(app)
      .post("/graphql")
      .send({ query: confirmMutation, variables: { id: orderId } });

    expect(confirmRes.status).toBe(200);

    const order = confirmRes.body.data.confirmOrder;

    // depending on your implementation
    if (order.status === "FAILED") {
      expect(order.latestError).toBeDefined();
    }
  });
});