
const typeDefs = `

  """
  Allowed lifecycle states for an order.
  """
  enum OrderStatus {
    PENDING
    CONFIRMED
    FAILED
  }

  """
  A single item within an order.
  """
  type OrderItem {
    sku: String!
    quantity: Int!
  }

  type OrderEvent {
    type: String!
    data: JSON
    createdAt: DateTime!
  }


  type Order {
    id: ID!
    customerIdentifier: String!
    destinationPostalCode: String
    status: OrderStatus!
    items: [OrderItem!]!
    fraudScore: Int
    shippingAmount: Float
    latestError: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }


  input OrderItemInput {
    sku: String!
    quantity: Int!
  }

  input CreateOrderInput {
    customerIdentifier: String!
    destinationPostalCode: String
    items: [OrderItemInput!]!
  }


  type Query {
    orders(status: OrderStatus): [Order]
    order(id: ID!): Order
    orderEvents(id: ID!): [OrderEvent]
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order
    confirmOrder(id: ID!): Order
  }

  scalar JSON
  scalar DateTime
`;

export default typeDefs;