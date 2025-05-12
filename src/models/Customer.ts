import { Schema, model, Document } from 'mongoose';

interface ICustomer extends Document {
  name: string;
  email: string;
  totalSpend: number;
  visitCount: number;
  lastPurchase?: Date;
  lastVisit?: Date;
  segments: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
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
      set: (value: any) => value ? new Date(value) : value,
      validate: {
        validator: (date: Date) => !date || date <= new Date(),
        message: 'Last purchase date cannot be in the future'
      }
    },
    lastVisit: {
      type: Date,
      set: (value: any) => value ? new Date(value) : value,
      validate: {
        validator: (date: Date) => !date || date <= new Date(),
        message: 'Last visit date cannot be in the future'
      }
    },
    segments: [{
      type: Schema.Types.ObjectId,
      ref: 'Segment',
      validate: {
        validator: async (ids: Schema.Types.ObjectId[]) => {
          const count = await model('Segment').countDocuments({ _id: { $in: ids } });
          return count === ids.length;
        },
        message: 'One or more Segment IDs are invalid'
      }
    }]
  },
  {
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
  }
);

CustomerSchema.index({ email: 1 });
CustomerSchema.index({ totalSpend: -1 });
CustomerSchema.index({ lastVisit: -1 });
CustomerSchema.index({ segments: 1 });

export default model<ICustomer>('Customer', CustomerSchema);