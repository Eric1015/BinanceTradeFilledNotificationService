
import { Handler } from 'aws-lambda';
import dotenv from 'dotenv';
import path from 'path';
import { OrdersController } from './controller/orders';
import { BinanceAPIController } from './controller/binanceAPI';
import { OrderStatus } from './model';
import { NotificationsController } from './controller/notifications';
const dotenvPath = path.join(__dirname, '../', `config/.env.${process.env.NODE_ENV}`);
dotenv.config({
  path: dotenvPath,
});

const notificationsController = new NotificationsController(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
  process.env.SENDGRID_API_KEY
);
const ordersController = new OrdersController();
const binanceAPIController = new BinanceAPIController(process.env.BINANCE_API_KEY, process.env.BINANCE_SECRET_KEY);

export const saveCurrentOpenOrders: Handler = async () => {
  const openOrders = await binanceAPIController.fetchOpenOrders();
  for (const order of openOrders) {
    const findOrderResult = await ordersController.find(order.orderId);
    if (findOrderResult) {
      await ordersController.update(findOrderResult, {
        status: order.status,
        executedQty: order.executedQty,
        cummulativeQuoteQty: order.cummulativeQuoteQty
      });
    } else {
      await ordersController.create({
        symbol: order.symbol,
        orderId: order.orderId,
        status: order.status,
        side: order.side,
        price: order.price,
        origQty: order.origQty,
        executedQty: order.executedQty,
        cummulativeQuoteQty: order.cummulativeQuoteQty,
        origQuoteOrderQty: order.origQuoteOrderQty
      });
    }
  }
}

export const updateSavedOpenOrders: Handler = async () => {
  const openOrders = await ordersController.getOpenOrders();
  for (const order of openOrders) {
    const fetchedOrder = await binanceAPIController.queryOrder({
      orderId: order.orderId,
      symbol: order.symbol,
    });
    if (fetchedOrder.status === OrderStatus.FILLED) {
      notificationsController.sendSMSAndEmailMessage({
        to: process.env.TARGET_EMAIL,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `Order #${fetchedOrder.orderId} filled!`,
        body: `Symbol: ${fetchedOrder.symbol}\nPrice: ${fetchedOrder.price}\nQuantity: ${fetchedOrder.executedQty}`,
      });
    }
    await ordersController.update(order, {
      status: fetchedOrder.status,
      executedQty: fetchedOrder.executedQty,
      cummulativeQuoteQty: fetchedOrder.cummulativeQuoteQty,
    });
  }
}
