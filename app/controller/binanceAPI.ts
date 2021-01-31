import axios, { AxiosInstance } from 'axios';
import CryptoJS from 'crypto-js';
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
    private secretKey: string;
    private http: AxiosInstance;
    constructor(apiKey: string, secretKey: string) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.http = axios.create({
            baseURL: 'https://api.binance.com',
            headers: {
                'X-MBX-APIKEY': this.apiKey,
            }
        })
    }

    async queryOrder(params: QueryOrderParams): Promise<Order | null> {
        const timestamp = new Date().getTime();
        const paramsStr = `symbol=${params.symbol}&orderId=${params.orderId}&timestamp=${timestamp}`
        const signature = this.getDigitalSignature(paramsStr);
        const res = await this.http.get(`/api/v3/order?${paramsStr}&signature=${signature}`);
        const orderResponse: Order | null = res.data;
        return orderResponse;
    }

    async fetchOpenOrders(params: FetchOpenOrdersParams = {}): Promise<Order[]> {
        const timestamp = new Date().getTime();
        const query = params.symbol ? `&symbol=${params.symbol}` : ``;
        const paramsStr = `timestamp=${timestamp}${query}`;
        const signature = this.getDigitalSignature(paramsStr);
        const res = await this.http.get(`/api/v3/openOrders?${paramsStr}&signature=${signature}`);
        const ordersResponse: Order[] = res.data;
        return ordersResponse;
    }

    private getDigitalSignature(params: string): string {
        const sigPayload = params;
        return CryptoJS.HmacSHA256(sigPayload, this.secretKey).toString(
          CryptoJS.enc.Hex
        );
    }
}