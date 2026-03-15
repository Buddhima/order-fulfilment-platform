import { gql } from "@apollo/client";

export const GET_ORDERS = gql`
  query Orders($status: OrderStatus) {
    orders(status: $status) {
      id
      customerIdentifier
      status
      createdAt
    }
  }
`;

export const GET_ORDER = gql`
  query Order($id: ID!) {
    order(id: $id) {
      id
      customerIdentifier
      destinationPostalCode
      status
      items {
        sku
        quantity
      }
      shippingAmount
      fraudScore
      latestError
      createdAt
      updatedAt
    }
  }
`;