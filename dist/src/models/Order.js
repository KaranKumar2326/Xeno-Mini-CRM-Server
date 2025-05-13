"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    items: [{
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }],
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    trackingId: {
        type: String,
        unique: true,
        index: true
    },
    shippingAddress: {
        street: String,
        city: String,
        postalCode: String
    }
}, {
    timestamps: true
});
// Indexes for faster queries
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
exports.default = (0, mongoose_1.model)('Order', OrderSchema);
