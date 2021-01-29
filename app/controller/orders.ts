import AWS from 'aws-sdk';
import { OrderSide, OrderStatus } from '../model';

interface DynamoDBOrderModel {
    symbol: string;
    orderId: number;
    status: OrderStatus;
    side: OrderSide;
    price: string;
    origQty: string;
    executedQty: string;
    cummulativeQuoteQty: string;
    origQuoteOrderQty: string;
}

interface CreateOrderParams {
    symbol: string;
    orderId: number;
    status: OrderStatus;
    side: OrderSide;
    price: string;
    origQty: string;
    executedQty: string;
    cummulativeQuoteQty: string;
    origQuoteOrderQty: string;
}

interface UpdateOrderParams {
    status: OrderStatus;
    executedQty: string;
    cummulativeQuoteQty: string;
}

const tableName = "binance-orders";

export class OrdersController {
    dynamoDb: AWS.DynamoDB.DocumentClient;

    constructor() {
        this.dynamoDb = new AWS.DynamoDB.DocumentClient();
    }

    async find(orderId: number): Promise<DynamoDBOrderModel | null> {
        try {
            const dynamoDbGetSimulationRequest = {
                ExpressionAttributeValues: {
                    ":v1": {
                        S: orderId,
                    }
                }, 
                KeyConditionExpression: "OrderId = :v1", 
                TableName: tableName,
            }
            const result = await this.dynamoDb.query(dynamoDbGetSimulationRequest).promise();
            const orders = result.Items;
            return orders ? this.parseDynamoDBData(orders[0]) : null;
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }

    // get orders that are still in NEW status (pending orders)
    async getOpenOrders(): Promise<DynamoDBOrderModel[]> {
        try {
            const dynamoDbGetSimulationRequest = {
                ExpressionAttributeValues: {
                    ":v1": {
                        S: OrderStatus.NEW,
                    }
                }, 
                KeyConditionExpression: "Status = :v1", 
                TableName: tableName,
            }
            const result = await this.dynamoDb.query(dynamoDbGetSimulationRequest).promise();
            const openOrders = result.Items;
            const parsedOpenOrders = openOrders.map(openOrder => this.parseDynamoDBData(openOrder));
            return parsedOpenOrders;
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }

    // create the order in DynamoDB
    async create(params: CreateOrderParams): Promise<void> {
        try {
            const dynamoDbCreateOrderRequest = this.getOrderDynamodbRequestParams({
                ...params,
            });
            const result = await this.dynamoDb.put(dynamoDbCreateOrderRequest).promise();
            console.log(result);
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }

    // update the simulation data in DynamoDB
    async update(orderItem: DynamoDBOrderModel, params: UpdateOrderParams): Promise<void> {
        try {
            const dynamoDbUpdateSimulationRequest = this.getOrderDynamodbRequestParams({
                ...orderItem,
                ...params,
            });
            const result = await this.dynamoDb.put(dynamoDbUpdateSimulationRequest).promise();
            console.log(result);
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    }

    private getOrderDynamodbRequestParams(params: DynamoDBOrderModel) {
        return {
            Item: {
                OrderId: {
                    S: params.orderId,
                },
                Symbol: {
                    S: params.symbol,
                },
                Status: {
                    S: params.status,
                },
                Side: {
                    S: params.side,
                },
                Price: {
                    N: parseFloat(params.price),
                },
                OriginalQuantity: {
                    N: parseFloat(params.origQty),
                },
                ExecutedQuantity: {
                    N: parseFloat(params.executedQty),
                },
                CummulativeQuoteQuantity: {
                    N: parseFloat(params.cummulativeQuoteQty),
                },
                OriginalQuoteQuantity: {
                    N: parseFloat(params.origQuoteOrderQty),
                }
            },
            TableName: tableName,
        }
    }

    private parseDynamoDBData(data: AWS.DynamoDB.DocumentClient.ItemCollectionKeyAttributeMap): DynamoDBOrderModel {
        return {
            symbol: data.Symbol,
            orderId: data.OrderId,
            status: data.Status,
            side: data.Side,
            price: data.Price.toString(),
            origQty: data.OriginalQuantity.toString(),
            executedQty: data.ExecutedQuantity.toString(),
            cummulativeQuoteQty: data.CummulativeQuoteQuantity.toString(),
            origQuoteOrderQty: data.OriginalQuoteQuantity.toString(),
        }
    }
}