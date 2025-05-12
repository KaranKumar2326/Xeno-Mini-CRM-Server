import Campaign from '../models/Campaign';
import redisClient from '../config/redis';
import { Types } from 'mongoose';

interface MockCustomer {
  _id: Types.ObjectId;
  name: string;
}

export class CampaignService {
  private static async simulateDelivery(campaignId: string, customers: MockCustomer[]) {
    const batchSize = 100;
    let successfulDeliveries = 0;

    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(() => Math.random() < 0.9) // 90% success rate
      );
      successfulDeliveries += results.filter(Boolean).length;

      // Batch update progress
      if (i % 1000 === 0) {
        await Campaign.findByIdAndUpdate(campaignId, {
          $set: {
            sentCount: successfulDeliveries,
            failedCount: i + batch.length - successfulDeliveries
          }
        });
      }
    }
    return successfulDeliveries;
  }



  public static async processQueue() {
    while (true) {
      let campaignId: string | null = null;
      try {
        campaignId = await redisClient.rPop('campaign:queue');
        if (!campaignId) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) continue;

        console.log(`Processing campaign: ${campaign.name}`);

        // Generate mock customer data
        const mockCustomers: MockCustomer[] = Array.from(
          { length: campaign.audienceSize },
          (_, i) => ({
            _id: new Types.ObjectId(),
            name: `Customer ${i + 1}`
          })
        );

        // Process in batches
        const successfulDeliveries = await this.simulateDelivery(campaignId, mockCustomers);

        // Final update
        await Campaign.findByIdAndUpdate(campaignId, {
          status: 'sent',
          sentCount: successfulDeliveries,
          failedCount: campaign.audienceSize - successfulDeliveries,
          completedAt: new Date()
        });

      } catch (error) {
        console.error('Campaign processing error:', error);
        if (campaignId) {
          await Campaign.findByIdAndUpdate(campaignId, {
            status: 'failed'
          });
        }
      }
    }
  }
}