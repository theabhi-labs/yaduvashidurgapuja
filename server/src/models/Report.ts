import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ReportReason = 'inappropriate' | 'spam' | 'offensive' | 'misleading' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface IReport extends Document {
  memoryId: Types.ObjectId;
  reporterId: Types.ObjectId;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    memoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Memory',
      required: [true, 'स्मृति आईडी आवश्यक है'],
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'रिपोर्टर आईडी आवश्यक है'],
      index: true,
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'offensive', 'misleading', 'other'],
      required: [true, 'रिपोर्ट का कारण चुनना आवश्यक है'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'विवरण 500 अक्षरों से अधिक नहीं हो सकता'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent the same user from spam-reporting the same memory multiple times
ReportSchema.index({ memoryId: 1, reporterId: 1 }, { unique: true });

export const Report: Model<IReport> = mongoose.model<IReport>('Report', ReportSchema);
