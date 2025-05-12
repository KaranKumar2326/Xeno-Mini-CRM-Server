import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import { Types } from 'mongoose';
import redisClient from '../config/redis';
import Campaign from '../models/Campaign';

interface DeliveryReceiptBody {
  campaignId: string;
  customerId: string;
  status: 'sent' | 'failed';
}

export const deliveryReceiptValidator = [
  body('campaignId').isMongoId().withMessage('Invalid campaign ID'),
  body('customerId').isMongoId().withMessage('Invalid customer ID'),
  body('status').isIn(['sent', 'failed']).withMessage('Invalid status')
];




export const handleDeliveryReceipt = async (
  req: Request<{}, {}, DeliveryReceiptBody>,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { campaignId, customerId, status } = req.body;

    const campaignExists = await Campaign.exists({ _id: campaignId });
    if (!campaignExists) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    await redisClient.lPush(
      'delivery:updates',
      JSON.stringify({
        campaignId: new Types.ObjectId(campaignId),
        customerId: new Types.ObjectId(customerId),
        status,
        timestamp: new Date()
      })
    );

    res.status(202).json({ 
      success: true,
      message: 'Receipt queued for processing'
    });

  } catch (error) {
    console.error('Delivery receipt error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
