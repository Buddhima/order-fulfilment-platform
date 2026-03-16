import { RuntimeConfig } from "../types/runtimeConfig";


import { inventory, fraud, shipping } from "@assessment/proto";

export function createServiceClients(cfg: RuntimeConfig) {

    const inventoryClient = inventory.createInventoryClient(cfg.inventoryServiceAddress);
    const fraudClient = fraud.createFraudClient(cfg.fraudServiceAddress);
    const shippingClient = shipping.createShippingClient(cfg.shippingServiceAddress);

    return {
        inventory: inventoryClient,
        fraud: fraudClient,
        shipping: shippingClient,

        // add more service clients here
    };
}