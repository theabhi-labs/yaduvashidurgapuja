import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MemoryStatus = 'published' | 'hidden' | 'deleted';

export interface IMemoryImage {
  imageUrl: string;
  thumbnailUrl: string;
}

export interface IMemory extends Document {
  userId: Types.ObjectId;
  imageUrl: string;
  thumbnailUrl: string;
  images?: IMemoryImage[];
  caption: string;
  year: number;
  status: MemoryStatus;
  impressions: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'उपयोगकर्ता आईडी आवश्यक है'],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'तस्वीर का URL आवश्यक है'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'थंबनेल URL आवश्यक है'],
    },
    images: [
      {
        imageUrl: { type: String, required: true },
        thumbnailUrl: { type: String, required: true },
      },
    ],
    caption: {
      type: String,
      required: [true, 'कृपया स्मृति का संक्षिप्त विवरण या शीर्षक लिखें'],
      trim: true,
      maxlength: [600, 'विवरण 600 अक्षरों से अधिक नहीं हो सकता'],
    },
    year: {
      type: Number,
      required: [true, 'वर्ष दर्ज करना आवश्यक है'],
      min: [1970, 'वर्ष 1970 से पहले का नहीं हो सकता'],
      max: [2099, 'वर्ष मान्य होना चाहिए'],
      index: true,
    },
    status: {
      type: String,
      enum: ['published', 'hidden', 'deleted'],
      default: 'published',
      index: true,
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0,
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

// Compound indexes for optimal queries
MemorySchema.index({ status: 1, createdAt: -1 });
MemorySchema.index({ status: 1, year: -1, createdAt: -1 });
MemorySchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Memory: Model<IMemory> = mongoose.model<IMemory>('Memory', MemorySchema);
