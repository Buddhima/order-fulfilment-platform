import { InventoryServiceClient } from "@assessment/proto/build/inventory/v1/inventory_grpc_pb.js";
import { ReserveItemsRequest, ReserveItem } from "@assessment/proto/build/inventory/v1/inventory_pb.js";
import { RuntimeConfig } from "../types/runtimeConfig";
import * as grpc from "@grpc/grpc-js";

export interface ReserveInventoryRequest {
    order_id: string, items: [{ sku: string, quantity: number }]
}

export interface ReserveInventoryResponse {
    reserved: boolean, reason: string, results: [{ sku: string, requested_quantity: number, remaining_quantity: number, reserved: boolean }]
}


export class InventoryService {

    private client: InventoryServiceClient;

    private timeoutMs = 5000;

    constructor(cfg: RuntimeConfig) {
        this.client = new InventoryServiceClient(
            cfg.inventoryServiceAddress,
            grpc.credentials.createInsecure(),
        );
    }


    async reserveInventory(data: ReserveInventoryRequest): Promise<ReserveInventoryResponse> {
        const req = new ReserveItemsRequest();
        if (data.order_id) req.setOrderId(data.order_id);

        if (Array.isArray(data.items)) {
            const protoItems = data.items.map(({ sku, quantity }: { sku: string, quantity: number }) => {
                const item = new ReserveItem();
                if (sku) item.setSku(sku);
                if (quantity != null) item.setQuantity(quantity);
                return item;
            });
            req.setItemsList(protoItems);
        }

        const deadline = new Date(Date.now() + this.timeoutMs);

        return new Promise((resolve, reject) => {


            this.client.reserveItems(req, { deadline }, (err, res: any) => {
                if (err) return reject(err);

                const results = res.getResultsList().map((r: any) => ({
                    sku: r.getSku(),
                    requested_quantity: r.getRequestedQuantity(),
                    remaining_quantity: r.getRemainingQuantity(),
                    reserved: r.getReserved(),
                }));

                resolve({
                    reserved: res.getReserved(),
                    reason: res.getReason(),
                    results,
                });
            });
        });
    }
}