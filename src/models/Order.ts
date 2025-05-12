import { Schema, model, Document, Types } from 'mongoose';

interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

interface IOrder extends Document {
  customerId: Types.ObjectId;
  amount: number;
  items: IOrderItem[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  trackingId: string;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode?: string;
  };
}

const OrderSchema = new Schema<IOrder>({
  customerId: { 
    type: Schema.Types.ObjectId, 
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
      type: Schema.Types.ObjectId, 
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
    enum: ['pending', 'processing', 'completed', 'failed' , 'cancelled'],
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
},
{ 
  timestamps: true 
});

// Indexes for faster queries
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default model<IOrder>('Order', OrderSchema);