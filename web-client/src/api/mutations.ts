import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
    }
  }
`;

export const CONFIRM_ORDER = gql`
  mutation ConfirmOrder($id: ID!) {
    confirmOrder(id: $id) {
      id
      status
    }
  }
`;