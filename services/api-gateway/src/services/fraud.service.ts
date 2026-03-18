import { FraudScoreServiceClient } from "@assessment/proto/build/fraud/v1/fraud_grpc_pb";
import { ScoreOrderRequest } from "@assessment/proto/build/fraud/v1/fraud_pb";
import { RuntimeConfig } from "../types/runtimeConfig";
import * as grpc from "@grpc/grpc-js";

export interface GetScoreRequest {
    order_id: string, customer_identifier: string, total_quantity: number
}

export interface GetScoreResponse {
    score: number, blocked: boolean, reason: string
}


export class FraudService {

    private client: FraudScoreServiceClient;

    private timeoutMs = 5000;

    constructor(cfg: RuntimeConfig) {
        this.client = new FraudScoreServiceClient(
            cfg.fraudServiceAddress,
            grpc.credentials.createInsecure(),
        );
    }


    async getScoreOrder(data: GetScoreRequest): Promise<GetScoreResponse> {
        const req = new ScoreOrderRequest();

        if (data.order_id) req.setOrderId(data.order_id);
        if (data.customer_identifier)
            req.setCustomerIdentifier(data.customer_identifier);
        if (data.total_quantity != null)
            req.setTotalQuantity(data.total_quantity);

        const deadline = new Date(Date.now() + this.timeoutMs);

        return new Promise((resolve, reject) => {
            this.client.scoreOrder(req, { deadline }, (error, res: any) => {
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
    }
}