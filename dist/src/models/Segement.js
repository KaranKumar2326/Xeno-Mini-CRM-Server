"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Segement.ts
const mongoose_1 = require("mongoose");
const RuleSchema = new mongoose_1.Schema({
    field: {
        type: String,
        required: [true, 'Field is required'],
        enum: ['totalSpend', 'visitCount', 'lastPurchase', 'lastVisit']
    },
    operator: {
        type: String,
        required: [true, 'Operator is required'],
        enum: ['>', '<', '==', '!=', '>=', '<=']
    },
    value: {
        type: mongoose_1.Schema.Types.Mixed,
        required: [true, 'Value is required'],
        validate: {
            validator: function (value) {
                const field = this.field;
                if (['totalSpend', 'visitCount'].includes(field)) {
                    return !isNaN(Number(value));
                }
                if (['lastPurchase', 'lastVisit'].includes(field)) {
                    return !isNaN(new Date(value).getTime());
                }
                return true;
            },
            message: 'Invalid value for field {PATH}'
        }
    }
}, { _id: false });
const RuleGroupSchema = new mongoose_1.Schema({
    condition: {
        type: String,
        enum: ['AND', 'OR'],
        required: [true, 'Condition is required']
    },
    rules: {
        type: [RuleSchema], // Change from Mixed to RuleSchema
        required: [true, 'Rules are required'],
        validate: {
            validator: function (rules) {
                return rules?.length > 0 && rules.every(rule => rule.condition
                    ? rule.rules?.length > 0
                    : rule.field && rule.operator && rule.value !== undefined);
            },
            message: 'Invalid rules structure'
        }
    }
}, { _id: false });
const SegmentSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Cannot exceed 500 characters']
    },
    rules: {
        type: RuleGroupSchema, // Use RuleGroupSchema here
        required: [true, 'Rules are required']
    },
    campaigns: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Campaign',
            validate: {
                validator: async function (ids) {
                    try {
                        const count = await (0, mongoose_1.model)('Campaign').countDocuments({ _id: { $in: ids } });
                        return count === ids.length;
                    }
                    catch {
                        return false;
                    }
                },
                message: 'Invalid Campaign IDs'
            }
        }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    }
});
SegmentSchema.virtual('customerCount', {
    ref: 'Customer',
    localField: '_id',
    foreignField: 'segments',
    count: true
});
SegmentSchema.index({ name: 1 }, { unique: true });
SegmentSchema.index({ createdBy: 1 });
SegmentSchema.index({ createdAt: -1 });
exports.default = (0, mongoose_1.model)('Segment', SegmentSchema);
