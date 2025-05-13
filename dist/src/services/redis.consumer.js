"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOrderConsumer = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const Order_1 = __importDefault(require("../models/Order"));
const startOrderConsumer = async () => {
    const consumer = redis_1.default.duplicate();
    await consumer.connect();
    await consumer.subscribe('new-orders', async (message) => {
        console.log('📦 Received new order message from Redis');
        try {
            const orderData = JSON.parse(message);
            // Add 2-second delay ONLY in development
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            // Check if order was cancelled during the delay
            const existingOrder = await Order_1.default.findOne({ trackingId: orderData.trackingId });
            if (existingOrder?.status === 'cancelled') {
                console.log(`🛑 Order ${orderData.trackingId} was cancelled`);
                return;
            }
            const order = new Order_1.default({
                ...orderData,
                status: orderData.status || 'processing' // Default status
            });
            await order.save();
            console.log(`✅ Order saved: ${order.trackingId}`);
        }
        catch (err) {
            console.error('❌ Order processing failed:', err.message);
            await consumer.publish('orders-dlq', message);
        }
    });
    console.log('📡 Redis consumer subscribed to "new-orders"');
};
exports.startOrderConsumer = startOrderConsumer;
