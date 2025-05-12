import { Document, Types } from 'mongoose';

// Core Types
export type FieldType = 'number' | 'date';
export type Operator = '>' | '<' | '==' | '!=' | '>=' | '<=';

// Status Types
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type CommunicationStatus = 'pending' | 'sent' | 'failed';

// Rule Definitions
export interface Rule {
  field: string;
  operator: Operator;
  value: number | string;
  fieldType?: FieldType;
}

export interface RuleGroup {
  condition: 'AND' | 'OR';
  rules: (Rule | RuleGroup)[];
}

// Communication Interface
export interface ICommunication {
  customerId: Types.ObjectId;
  status: CommunicationStatus;
  timestamp: Date;
  error?: string;
  metadata?: Record<string, any>;
}

// Campaign Interface
export interface ICampaign extends Document {
  name: string;
  rules: RuleGroup;
  messageTemplate: string;
  status: CampaignStatus;
  audienceSize: number;
  sentCount: number;
  failedCount: number;
  communications: ICommunication[];
  metadata?: {
    startedAt?: Date;
    completedAt?: Date;
    durationMs?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Segment Interface
export interface ISegment extends Document {
  name: string;
  description?: string;
  rules: RuleGroup;
  customerCount?: number;
  campaigns: Types.ObjectId[];
  createdBy: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

// Customer Interface (if needed)
export interface ICustomer extends Document {
  name: string;
  email: string;
  totalSpend: number;
  visitCount: number;
  lastPurchase: Date;
  lastVisit: Date;
  segments: Types.ObjectId[];
}