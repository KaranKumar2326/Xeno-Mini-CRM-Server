"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorService = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const RECEIPT_API_URL = process.env.RECEIPT_API_URL || 'http://localhost:3001/api/delivery/receipt';
class VendorService {
    static async sendMessage(campaignId, customer, message) {
        try {
            // Simulate vendor delay
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
            const isSuccess = Math.random() < 0.9;
            const status = isSuccess ? 'sent' : 'failed';
            const messageId = (0, uuid_1.v4)();
            console.log(`📤 Message to ${customer.name} [${status}]`);
            // Notify backend via delivery receipt
            await axios_1.default.post(RECEIPT_API_URL, {
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
        }
        catch (error) {
            console.error('❌ VendorService error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
}
exports.VendorService = VendorService;
