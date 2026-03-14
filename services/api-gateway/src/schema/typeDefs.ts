
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


  type Order {
    id: ID!
    customerIdentifier: String!
    destinationPostalCode: String
    status: OrderStatus!
    items: [OrderItem!]!
    fraudScore: Int
    shippingAmount: Float
    latestError: String
    createdAt: String!
    updatedAt: String!
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
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order
    confirmOrder(id: ID!): Order
  }
`;

export default typeDefs;