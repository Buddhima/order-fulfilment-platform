import { RuntimeConfig } from "../types/runtimeConfig";

import { InventoryServiceClient } from "@assessment/proto/build/inventory/v1/inventory_grpc_pb.js";
import { ReserveItemsRequest, ReserveItem } from "@assessment/proto/build/inventory/v1/inventory_pb.js";

import { ShippingQuoteServiceClient } from "@assessment/proto/build/shipping/v1/shipping_grpc_pb";
import { GetQuoteRequest } from "@assessment/proto/build/shipping/v1/shipping_pb";

import { FraudScoreServiceClient } from "@assessment/proto/build/fraud/v1/fraud_grpc_pb";
import { ScoreOrderRequest } from "@assessment/proto/build/fraud/v1/fraud_pb";

import * as grpc from "@grpc/grpc-js";

export function createServiceClients(cfg: RuntimeConfig) {

    const timeoutMs = 5000;

    const inventoryClient = () => {
        const client = new InventoryServiceClient(
            cfg.inventoryServiceAddress,
            grpc.credentials.createInsecure(),
        );

        return {
            /**
             * Reserve items
             * @param {Object} data - { order_id: string, items: [{ sku, quantity }] }
             * @returns {Promise<Object>} - resolved response
             */
            async reserveItems(data: any) {
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

                const deadline = new Date(Date.now() + timeoutMs);

                return new Promise((resolve, reject) => {


                    client.reserveItems(req, { deadline }, (err, res: any) => {
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
            },
        };
    };


    const fraudClient = () => {
        const client = new FraudScoreServiceClient(
            cfg.fraudServiceAddress,
            grpc.credentials.createInsecure(),
        );

        return {
            /**
             * Score an order for fraud risk
             * @param {Object} data
             * @returns {Promise<Object>}
             */
            async scoreOrder(data: any) {
                const req = new ScoreOrderRequest();

                if (data.order_id) req.setOrderId(data.order_id);
                if (data.customer_identifier)
                    req.setCustomerIdentifier(data.customer_identifier);
                if (data.total_quantity != null)
                    req.setTotalQuantity(data.total_quantity);

                const deadline = new Date(Date.now() + timeoutMs);

                return new Promise((resolve, reject) => {
                    client.scoreOrder(req, { deadline }, (error, res: any) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve({
                            score: res.getScore(),
                            blocked: res.getBlocked(),
                            reason: res.getReason(),
                        });
                    });
                });
            },
        };
    };

    const shippingClient = () => {
        const client = new ShippingQuoteServiceClient(
            cfg.shippingServiceAddress,
            grpc.credentials.createInsecure(),
        );

        // console.log("shipping client init");

        return {
            /**
             * Get shipping quote
             * @param {Object} data
             * @returns {Promise<Object>}
             */
            async getQuote(data: any) {
                const req = new GetQuoteRequest();

                if (data.order_id) req.setOrderId(data.order_id);
                if (data.destination_postal_code)
                    req.setDestinationPostalCode(data.destination_postal_code);
                if (data.item_count != null) req.setItemCount(data.item_count);
                if (data.total_quantity != null) req.setTotalQuantity(data.total_quantity);

                const deadline = new Date(Date.now() + timeoutMs);

                return new Promise((resolve, reject) => {
                    client.getQuote(req, { deadline }, (error, res: any) => {
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
            },
        };
    };

    return {
        inventory: inventoryClient(),
        fraud: fraudClient(),
        shipping: shippingClient(),

        // add more service clients here
    };
}