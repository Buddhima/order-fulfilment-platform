import { ShippingQuoteServiceClient } from "@assessment/proto/build/shipping/v1/shipping_grpc_pb";
import { GetQuoteRequest } from "@assessment/proto/build/shipping/v1/shipping_pb";
import { RuntimeConfig } from "../types/runtime-config.type";
import * as grpc from "@grpc/grpc-js";

export interface ShippingQuoteRequest {
    order_id: string, destination_postal_code: string, item_count: number, total_quantity: number
}

export interface ShippingQuoteResponse {
    available: boolean, amount: number, currency: string, reason: string
}


export class ShippingService {

    private client: ShippingQuoteServiceClient;

    private timeoutMs = 5000;

    constructor(cfg: RuntimeConfig) {
        this.client = new ShippingQuoteServiceClient(
            cfg.shippingServiceAddress,
            grpc.credentials.createInsecure(),
        );
    }


    async getQuote(data: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
        const req = new GetQuoteRequest();

        if (data.order_id) req.setOrderId(data.order_id);
        if (data.destination_postal_code)
            req.setDestinationPostalCode(data.destination_postal_code);
        if (data.item_count != null) req.setItemCount(data.item_count);
        if (data.total_quantity != null) req.setTotalQuantity(data.total_quantity);

        const deadline = new Date(Date.now() + this.timeoutMs);

        return new Promise((resolve, reject) => {
            this.client.getQuote(req, { deadline }, (error, res: any) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    available: res.getAvailable(),
                    amount: res.getAmount(),
                    currency: res.getCurrency(),
                    reason: res.getReason(),
                });
            });
        });
    }
}