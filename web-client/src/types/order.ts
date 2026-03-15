export interface OrderItem {
  sku: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerIdentifier: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  items: OrderItem[];
}