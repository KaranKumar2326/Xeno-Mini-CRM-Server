import redisClient from "../config/redis";
import Order from '../models/Order';

interface OrderData {
  trackingId: string;
  customerId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  amount: number;
  status?: string;  // Made optional
  createdAt: string;
}

export const startOrderConsumer = async () => {
  const consumer = redisClient.duplicate();
  await consumer.connect();

  await consumer.subscribe('new-orders', async (message: string) => {
    console.log('📦 Received new order message from Redis');

    try {
      const orderData: OrderData = JSON.parse(message);
      
      // Add 2-second delay ONLY in development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Check if order was cancelled during the delay
      const existingOrder = await Order.findOne({ trackingId: orderData.trackingId });
      if (existingOrder?.status === 'cancelled') {
        console.log(`🛑 Order ${orderData.trackingId} was cancelled`);
        return;
      }

      const order = new Order({
        ...orderData,
        status: orderData.status || 'processing'  // Default status
      });

      await order.save();
      console.log(`✅ Order saved: ${order.trackingId}`);
    } catch (err: any) {
      console.error('❌ Order processing failed:', err.message);
      await consumer.publish('orders-dlq', message);
    }
  });

  console.log('📡 Redis consumer subscribed to "new-orders"');
};