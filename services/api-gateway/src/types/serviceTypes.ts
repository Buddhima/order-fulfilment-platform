export interface InventoryServiceResponse {
    reserved: boolean,
    reason: string,
    results: [
        {
            sku: string,
            requested_quantity: number,
            remaining_quantity: number,
            reserved: boolean
        }
    ]
}

export interface FraudServiceResponse {
    score: number, blocked: boolean, reason: string
}

export interface ShippingServiceResponse {
    available: boolean, amount: number, currency: string, reason: string
}