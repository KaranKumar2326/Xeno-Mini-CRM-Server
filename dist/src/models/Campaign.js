"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommunicationSchema = new mongoose_1.Schema({
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    error: String,
    metadata: mongoose_1.Schema.Types.Mixed
}, { _id: false });
const CampaignSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true,
        maxlength: [100, 'Cannot exceed 100 characters'],
        index: true
    },
    rules: {
        type: mongoose_1.Schema.Types.Mixed,
        required: [true, 'Rules are required'],
        validate: {
            validator: function (value) {
                try {
                    return value?.condition &&
                        ['AND', 'OR'].includes(value.condition) &&
                        Array.isArray(value.rules);
                }
                catch {
                    return false;
                }
            },
            message: 'Invalid RuleGroup structure'
        }
    },
    messageTemplate: {
        type: String,
        required: [true, 'Message template is required'],
        minlength: [10, 'Must be at least 10 characters']
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
        default: 'draft',
        index: true
    },
    audienceSize: {
        type: Number,
        required: [true, 'Audience size is required'],
        min: [1, 'Must be at least 1']
    },
    sentCount: { type: Number, default: 0, min: 0 },
    failedCount: { type: Number, default: 0, min: 0 },
    communications: [CommunicationSchema],
    metadata: {
        startedAt: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !this.metadata?.completedAt || value <= this.metadata.completedAt;
                },
                message: 'Must be before completion date'
            }
        },
        completedAt: Date,
        durationMs: { type: Number, min: 0 }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    statics: {
        async findByStatus(status) {
            return this.find({ status }).sort({ createdAt: -1 }).lean();
        },
        async getActiveCampaigns() {
            return this.find({ status: { $in: ['scheduled', 'sending'] } });
        }
    }
});
// Virtuals
CampaignSchema.virtual('successRate').get(function () {
    return this.audienceSize > 0
        ? Math.round((this.sentCount / this.audienceSize) * 100)
        : 0;
});
CampaignSchema.virtual('pendingCount').get(function () {
    return Math.max(0, this.audienceSize - this.sentCount - this.failedCount);
});
// Hooks
CampaignSchema.pre('save', function (next) {
    if (this.metadata?.startedAt && this.metadata?.completedAt) {
        this.metadata.durationMs =
            this.metadata.completedAt.getTime() - this.metadata.startedAt.getTime();
    }
    next();
});
exports.default = (0, mongoose_1.model)('Campaign', CampaignSchema);
