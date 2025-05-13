"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeliveryReceipt = exports.deliveryReceiptValidator = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
const redis_1 = __importDefault(require("../config/redis"));
const Campaign_1 = __importDefault(require("../models/Campaign"));
exports.deliveryReceiptValidator = [
    (0, express_validator_1.body)('campaignId').isMongoId().withMessage('Invalid campaign ID'),
    (0, express_validator_1.body)('customerId').isMongoId().withMessage('Invalid customer ID'),
    (0, express_validator_1.body)('status').isIn(['sent', 'failed']).withMessage('Invalid status')
];
const handleDeliveryReceipt = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { campaignId, customerId, status } = req.body;
        const campaignExists = await Campaign_1.default.exists({ _id: campaignId });
        if (!campaignExists) {
            res.status(404).json({ error: 'Campaign not found' });
            return;
        }
        await redis_1.default.lPush('delivery:updates', JSON.stringify({
            campaignId: new mongoose_1.Types.ObjectId(campaignId),
            customerId: new mongoose_1.Types.ObjectId(customerId),
            status,
            timestamp: new Date()
        }));
        res.status(202).json({
            success: true,
            message: 'Receipt queued for processing'
        });
    }
    catch (error) {
        console.error('Delivery receipt error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.handleDeliveryReceipt = handleDeliveryReceipt;
