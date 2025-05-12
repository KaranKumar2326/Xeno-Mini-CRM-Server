import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const RECEIPT_API_URL = process.env.RECEIPT_API_URL || 'http://localhost:3001/api/delivery/receipt';

export class VendorService {
  static async sendMessage(
    campaignId: string,
    customer: { id: string; name: string; phone: string },
    message: string
  ) {
    try {
      // Simulate vendor delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

      const isSuccess = Math.random() < 0.9;
      const status = isSuccess ? 'sent' : 'failed';
      const messageId = uuidv4();

      console.log(`📤 Message to ${customer.name} [${status}]`);

      // Notify backend via delivery receipt
      await axios.post(RECEIPT_API_URL, {
        campaignId,
        customerId: customer.id,
        status
      });

      return {
        success: isSuccess,
        messageId,
        status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ VendorService error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
}
