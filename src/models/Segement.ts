// src/models/Segement.ts
import { Schema, model, Types } from 'mongoose';
import { ISegment, RuleGroup, Rule } from '../types';

const RuleSchema = new Schema<Rule>({
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
    type: Schema.Types.Mixed,
    required: [true, 'Value is required'],
    validate: {
      validator: function(this: Rule, value: any) {
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

const RuleGroupSchema = new Schema<RuleGroup>({
  condition: {
    type: String,
    enum: ['AND', 'OR'],
    required: [true, 'Condition is required']
  },
  rules: {
    type: [RuleSchema],  // Change from Mixed to RuleSchema
    required: [true, 'Rules are required'],
    validate: {
      validator: function(rules: any[]) {
        return rules?.length > 0 && rules.every(rule => 
          rule.condition 
            ? rule.rules?.length > 0
            : rule.field && rule.operator && rule.value !== undefined
        );
      },
      message: 'Invalid rules structure'
    }
  }
}, { _id: false });

const SegmentSchema = new Schema<ISegment>({
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
    type: RuleGroupSchema,  // Use RuleGroupSchema here
    required: [true, 'Rules are required']
  },
  campaigns: [{
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    validate: {
      validator: async function(ids: Types.ObjectId[]) {
        try {
          const count = await model('Campaign').countDocuments({ _id: { $in: ids } });
          return count === ids.length;
        } catch {
          return false;
        }
      },
      message: 'Invalid Campaign IDs'
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
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

export default model<ISegment>('Segment', SegmentSchema);
