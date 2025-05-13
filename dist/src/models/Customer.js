"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CustomerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    totalSpend: {
        type: Number,
        default: 0,
        min: [0, 'Total spend cannot be negative']
    },
    visitCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastPurchase: {
        type: Date,
        set: (value) => value ? new Date(value) : value,
        validate: {
            validator: (date) => !date || date <= new Date(),
            message: 'Last purchase date cannot be in the future'
        }
    },
    lastVisit: {
        type: Date,
        set: (value) => value ? new Date(value) : value,
        validate: {
            validator: (date) => !date || date <= new Date(),
            message: 'Last visit date cannot be in the future'
        }
    },
    segments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Segment',
            validate: {
                validator: async (ids) => {
                    const count = await (0, mongoose_1.model)('Segment').countDocuments({ _id: { $in: ids } });
                    return count === ids.length;
                },
                message: 'One or more Segment IDs are invalid'
            }
        }]
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
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ totalSpend: -1 });
CustomerSchema.index({ lastVisit: -1 });
CustomerSchema.index({ segments: 1 });
exports.default = (0, mongoose_1.model)('Customer', CustomerSchema);
