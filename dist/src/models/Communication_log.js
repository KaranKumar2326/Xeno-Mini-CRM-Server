"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/models/CommunicationLog.ts
const mongoose_1 = require("mongoose");
const CommunicationLogSchema = new mongoose_1.Schema({
    campaignId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    deliveredAt: { type: Date },
    error: { type: String }
}, { timestamps: true });
// Indexes for faster queries
CommunicationLogSchema.index({ campaignId: 1 });
CommunicationLogSchema.index({ customerId: 1 });
CommunicationLogSchema.index({ status: 1 });
exports.default = (0, mongoose_1.model)('CommunicationLog', CommunicationLogSchema);
