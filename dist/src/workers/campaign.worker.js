"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const db_1 = require("../config/db");
const Campaign_1 = __importDefault(require("../models/Campaign"));
const Communication_log_1 = __importDefault(require("../models/Communication_log"));
// Configure Redis client for your 3001 port environment
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000) // Exponential backoff
    }
});
// Enhanced batch processor
const BATCH_SIZE = 100;
const PROCESSING_INTERVAL = 3000;
const processBatch = async (updates) => {
    await (0, db_1.connectDB)(); // Ensure DB connection
    const campaignUpdates = new Map();
    const logEntries = [];
    // Group updates by campaign
    updates.forEach(update => {
        const counts = campaignUpdates.get(update.campaignId) || { sent: 0, failed: 0 };
        counts[update.status === 'sent' ? 'sent' : 'failed']++;
        campaignUpdates.set(update.campaignId, counts);
        logEntries.push({
            campaignId: update.campaignId,
            customerId: update.customerId,
            status: update.status,
            error: update.error,
            timestamp: update.timestamp,
            message: `Hi Customer, enjoy 10% off!` // Optional message property
        });
    });
    // Bulk update campaigns
    const campaignBulkOps = Array.from(campaignUpdates.entries()).map(([id, counts]) => ({
        updateOne: {
            filter: { _id: id },
            update: {
                $inc: {
                    sentCount: counts.sent,
                    failedCount: counts.failed
                },
                $set: { updatedAt: new Date() }
            }
        }
    }));
    // Bulk insert logs
    const logBulkOps = logEntries.map(log => ({
        insertOne: {
            document: log
        }
    }));
    await Promise.all([
        Campaign_1.default.bulkWrite(campaignBulkOps),
        Communication_log_1.default.bulkWrite(logBulkOps)
    ]);
};
const startWorker = async () => {
    try {
        await redisClient.connect();
        console.log('🚀 Delivery worker connected to Redis');
        setInterval(async () => {
            try {
                const messages = await redisClient.lRange('delivery:updates', 0, BATCH_SIZE - 1);
                if (messages.length === 0)
                    return;
                const updates = messages.map(msg => JSON.parse(msg.toString()));
                await processBatch(updates);
                // Remove processed messages
                await redisClient.lTrim('delivery:updates', BATCH_SIZE, -1);
                console.log(`Processed batch of ${updates.length} updates`);
            }
            catch (batchError) {
                console.error('Batch processing error:', batchError);
            }
        }, PROCESSING_INTERVAL);
    }
    catch (err) {
        console.error('❌ Worker startup failed:', err);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Stopping worker...');
    await redisClient.quit();
    process.exit(0);
});
startWorker();
