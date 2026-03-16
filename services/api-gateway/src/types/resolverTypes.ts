export type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";

export interface OrderItem {
  sku: string;
  quantity: number;
}

export interface OrderEvent {
  type: string;
  data?: any;
  createdAt: string;
}

export interface Order {
  id: number;
  customerIdentifier: string;
  destinationPostalCode?: string | null;
  status: OrderStatus;
  items: OrderItem[];
  fraudScore?: number | null;
  shippingAmount?: number | null;
  latestError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerIdentifier: string;
  destinationPostalCode?: string;
  items: OrderItem[];
}

export type OrdersArgs = {
  status?: OrderStatus;
};

export type OrderArgs = {
  id: string;
};

export type OrderEventsArgs = {
  id: string;
};

export type CreateOrderArgs = {
  input: CreateOrderInput;
};

export type ConfirmOrderArgs = {
  id: string;
};

