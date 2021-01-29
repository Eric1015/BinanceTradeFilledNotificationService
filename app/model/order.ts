export enum OrderStatus {
    NEW = "NEW",
    CANCELLED = "CANCELLED",
    FILLED = "FILLED",
}

export enum OrderType {
    LIMIT = "LIMIT",
    MARKET = "MARKET",
    STOP_LOSS = "STOP_LOSS",
    STOP_LOSS_LIMIT = "STOP_LOSS_LIMIT",
    TAKE_PROFIT = "TAKE_PROFIT",
    TAKE_PROFIT_LIMIT = "TAKE_PROFIT_LIMIT",
    LIMIT_MAKER = "LIMIT_MAKER",
}

export enum OrderSide {
    BUY = "BUY",
    SELL = "SELL",
}

export interface Order {
    symbol: string,
    orderId: number,
    orderListId: number,
    clientOrderId: string,
    price: string,
    origQty: string,
    executedQty: string,
    cummulativeQuoteQty: string,
    status: OrderStatus,
    timeInForce: string,
    type: OrderType,
    side: OrderSide,
    stopPrice: string,
    icebergQty: string,
    time: number,
    updateTime: number,
    isWorking: boolean,
    origQuoteOrderQty: string
}