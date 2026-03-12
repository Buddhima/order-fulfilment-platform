export interface InventoryRecord {
  sku: string;
  availableQuantity: number;
}

export const inventorySeed: InventoryRecord[] = [
  { sku: "SKU-RED-CHAIR", availableQuantity: 5 },
  { sku: "SKU-BLUE-LAMP", availableQuantity: 12 },
  { sku: "SKU-WHITE-DESK", availableQuantity: 3 },
  { sku: "SKU-GREY-SHELF", availableQuantity: 20 },
];
