"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const Campaign_1 = __importDefault(require("../models/Campaign"));
const redis_1 = __importDefault(require("../config/redis"));
const mongoose_1 = require("mongoose");
class CampaignService {
    static async simulateDelivery(campaignId, customers) {
        const batchSize = 100;
        let successfulDeliveries = 0;
        for (let i = 0; i < customers.length; i += batchSize) {
            const batch = customers.slice(i, i + batchSize);
            const results = await Promise.all(batch.map(() => Math.random() < 0.9) // 90% success rate
            );
            successfulDeliveries += results.filter(Boolean).length;
            // Batch update progress
            if (i % 1000 === 0) {
                await Campaign_1.default.findByIdAndUpdate(campaignId, {
                    $set: {
                        sentCount: successfulDeliveries,
                        failedCount: i + batch.length - successfulDeliveries
                    }
                });
            }
        }
        return successfulDeliveries;
    }
    static async processQueue() {
        while (true) {
            let campaignId = null;
            try {
                const result = await redis_1.default.rPop('campaign:queue');
                campaignId = typeof result === 'string' ? result : null;
                if (!campaignId) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                const campaign = await Campaign_1.default.findById(campaignId);
                if (!campaign)
                    continue;
                console.log(`Processing campaign: ${campaign.name}`);
                // Generate mock customer data
                const mockCustomers = Array.from({ length: campaign.audienceSize }, (_, i) => ({
                    _id: new mongoose_1.Types.ObjectId(),
                    name: `Customer ${i + 1}`
                }));
                // Process in batches
                const successfulDeliveries = await this.simulateDelivery(campaignId, mockCustomers);
                // Final update
                await Campaign_1.default.findByIdAndUpdate(campaignId, {
                    status: 'sent',
                    sentCount: successfulDeliveries,
                    failedCount: campaign.audienceSize - successfulDeliveries,
                    completedAt: new Date()
                });
            }
            catch (error) {
                console.error('Campaign processing error:', error);
                if (campaignId) {
                    await Campaign_1.default.findByIdAndUpdate(campaignId, {
                        status: 'failed'
                    });
                }
            }
        }
    }
}
exports.CampaignService = CampaignService;
