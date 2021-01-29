import axios, { AxiosInstance } from 'axios';
import { Order } from '../model';

interface QueryOrderParams {
    symbol: string;
    orderId: number;
}

interface FetchOpenOrdersParams {
    symbol?: string;
}

export class BinanceAPIController {
    private apiKey: string;
    private http: AxiosInstance;
    constructor(apiKey: string, _: string) {
        this.apiKey = apiKey;
        this.http = axios.create({
            baseURL: 'https://api.binance.com',
            headers: {
                'X-MBX-APIKEY': this.apiKey,
            }
        })
    }

    async queryOrder(params: QueryOrderParams): Promise<Order | null> {
        const timestamp = new Date().getTime();
        const res = await this.http.get(`/api/v3/order?symbol=${params.symbol}&orderId=${params.orderId}&timestamp=${timestamp}`);
        const orderResponse: Order | null = res.data;
        return orderResponse;
    }

    async fetchOpenOrders(params: FetchOpenOrdersParams = {}): Promise<Order[]> {
        const timestamp = new Date().getTime();
        const query = params.symbol ? `&symbol=${params.symbol}` : ``;
        const res = await this.http.get(`/api/v3/openOrders?timestamp=${timestamp}${query}`);
        const ordersResponse: Order[] = res.data;
        return ordersResponse;
    }
}