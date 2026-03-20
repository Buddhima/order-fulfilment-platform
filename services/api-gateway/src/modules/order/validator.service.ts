import { OrderRepository } from "../../repositories/orderRepository";
import { FraudService } from "../../services/fraud.service";
import { InventoryService } from "../../services/inventory.service";
import { ShippingService } from "../../services/shipping.service";
import { ORDER_EVENTS } from "../../constants/order-event.constants";

export interface ResultData {
    success: boolean;
    fraudScore: number | null;
    shippingAmount: number | null;
}

export class ValidatorService {

    private inventoryService: InventoryService;
    private fraudService: FraudService;
    private shippingService: ShippingService;

    constructor(inventoryService: InventoryService, fraudService: FraudService, shippingService: ShippingService) {
        this.inventoryService = inventoryService;
        this.fraudService = fraudService;
        this.shippingService = shippingService;
    }

    async validate(order: any, db: OrderRepository): Promise<ResultData> {

        // number of items
        const numberOfItems = order.items.length;

        // total quantity
        const totalQuantity = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

        // results from the services
        const resultData: ResultData = {
            success: false,
            fraudScore: null,
            shippingAmount: null
        };


        const orderId = order.id;

        // handler when backend response is failure
        const handleServiceFailure = async (status: string, error: any) => {
            await db.recordOrderEvent(orderId, status, error);
            await db.failOrder(orderId, status);
        };

        // handler when the service is failing
        const handleServiceError = async (status: string, error: any) => {
            await db.recordOrderEvent(orderId, status, error);
            await db.failOrder(orderId, status);
        };

        const services = [
            {
                name: "inventory",
                call: () => this.inventoryService.reserveInventory({ order_id: order.orderId, items: order.items }),
                interpret: (res: any): boolean => res.reserved === true,
                onSuccess: async (_: unknown) => {
                    await db.recordOrderEvent(orderId, ORDER_EVENTS.INVENTORY_RESERVATION_SUCCESS);
                },
                onFailure: async (res: any) => await handleServiceFailure(ORDER_EVENTS.INVENTORY_RESERVATION_FAILED, res),
                onError: async (error: any) => await handleServiceError(ORDER_EVENTS.INVENTORY_RESERVATION_ERROR, error),
            },
            {
                name: "fraud",
                call: () => this.fraudService.getScoreOrder({
                    order_id: order.orderId,
                    customer_identifier: order.customerIdentifier,
                    total_quantity: totalQuantity
                }),
                interpret: (res: any): boolean => res.blocked === false,
                onSuccess: async (res: any) => {
                    resultData.fraudScore = res.score;
                    await db.recordOrderEvent(orderId, ORDER_EVENTS.ORDER_SCORING_SUCCESS);
                },
                onFailure: async (res: any) => await handleServiceFailure(ORDER_EVENTS.ORDER_SCORING_FAILED, res),
                onError: async (error: any) => await handleServiceError(ORDER_EVENTS.ORDER_SCORING_ERROR, error),
            },
            {
                name: "shipping",
                call: () => this.shippingService.getQuote({
                    order_id: order.orderId,
                    destination_postal_code: order.destinationPostalCode,
                    item_count: numberOfItems,
                    total_quantity: totalQuantity
                }),
                interpret: (res: any): boolean => res.available == true,
                onSuccess: async (res: any) => {
                    resultData.shippingAmount = res.amount;
                    await db.recordOrderEvent(orderId, ORDER_EVENTS.SHIPPING_QUOTE_SUCCESS);
                },
                onFailure: async (res: any) => await handleServiceFailure(ORDER_EVENTS.SHIPPING_QUOTE_FAILED, res),
                onError: async (error: any) => await handleServiceError(ORDER_EVENTS.SHIPPING_QUOTE_ERROR, error),
            }
        ];

        // Execute the services
        const results = await Promise.all(
            services.map(async (svc) => {
                try {
                    const response = await svc.call();
                    const success = svc.interpret(response);

                    if (success)
                        svc.onSuccess(response);
                    else
                        svc.onFailure(response);

                    return success;

                } catch (err) {
                    svc.onError(err);

                    return false;
                }
            })
        );

        const anyFailed = results.some(r => !r);

        return {
            success: !anyFailed,
            fraudScore: resultData.fraudScore,
            shippingAmount: resultData.shippingAmount
        };
    }
}