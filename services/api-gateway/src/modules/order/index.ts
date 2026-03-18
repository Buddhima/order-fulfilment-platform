import { RuntimeConfig } from "../../types/runtimeConfig";

import { OrderService } from "./order.service";
import { buildRepositories } from "../../repositories/init";
import { ValidatorService } from "./validator.service";
import { InventoryService } from "../../services/inventory.service";
import { FraudService } from "../../services/fraud.service";
import { ShippingService } from "../../services/shipping.service";


export function createOrderService(config:RuntimeConfig) {
    const repo = buildRepositories(config);
    const validator = new ValidatorService(new InventoryService(config), new FraudService(config), new ShippingService(config));
    return new OrderService(validator, repo);
}

