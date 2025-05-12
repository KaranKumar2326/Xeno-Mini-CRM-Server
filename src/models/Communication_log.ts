// server/src/models/CommunicationLog.ts
import { Schema, model, Document, Types } from 'mongoose';

interface ICommunicationLog extends Document {
  campaignId: Types.ObjectId;
  customerId: Types.ObjectId;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  deliveredAt?: Date;
  error?: string;
}

const CommunicationLogSchema = new Schema<ICommunicationLog>({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
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

export default model<ICommunicationLog>('CommunicationLog', CommunicationLogSchema);