import { createClient, RedisClientType } from 'redis';

// Type-safe Redis client instance
const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Enhanced error handling
redisClient.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

// Connection management
let isConnected = false;

export const initRedis = async (): Promise<RedisClientType> => {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log('✅ Redis connected successfully');
    } catch (err) {
      console.error('❌ Failed to connect to Redis:', err);
      throw err;
    }
  }
  return redisClient;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (isConnected) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
  process.exit(0);
});

export default redisClient;