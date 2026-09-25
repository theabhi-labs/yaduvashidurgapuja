import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAd extends Document {
  title: string;
  imageUrl: string;
  linkUrl: string;
  sponsorName: string;
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  impressions: number;
  clicks: number;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title: {
      type: String,
      required: [true, 'Ad title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Ad image URL is required'],
    },
    linkUrl: {
      type: String,
      required: [true, 'Destination link URL is required'],
      trim: true,
    },
    sponsorName: {
      type: String,
      required: [true, 'Sponsor name is required'],
      trim: true,
      maxlength: [100, 'Sponsor name cannot exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
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

// Compound index for active ads lookup
AdSchema.index({ isActive: 1, priority: -1, createdAt: -1 });

export const Ad: Model<IAd> = mongoose.model<IAd>('Ad', AdSchema);
