"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRedis = void 0;
const redis_1 = require("redis");
// Type-safe Redis client instance
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
// Enhanced error handling
redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});
// Connection management
let isConnected = false;
const initRedis = async () => {
    if (!isConnected) {
        try {
            await redisClient.connect();
            isConnected = true;
            console.log('✅ Redis connected successfully');
        }
        catch (err) {
            console.error('❌ Failed to connect to Redis:', err);
            throw err;
        }
    }
    return redisClient;
};
exports.initRedis = initRedis;
// Graceful shutdown
process.on('SIGINT', async () => {
    if (isConnected) {
        await redisClient.quit();
        console.log('Redis connection closed');
    }
    process.exit(0);
});
exports.default = redisClient;
