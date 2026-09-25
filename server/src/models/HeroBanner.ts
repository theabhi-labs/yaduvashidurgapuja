import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IHeroBanner extends Document {
  title: string;
  badge?: string;
  subtext?: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const HeroBannerSchema = new Schema<IHeroBanner>(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    badge: {
      type: String,
      trim: true,
      default: 'कपूरिपुर पावन धाम',
      maxlength: [60, 'Badge cannot exceed 60 characters'],
    },
    subtext: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtext cannot exceed 300 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

HeroBannerSchema.index({ isActive: 1, order: 1, createdAt: -1 });

export const HeroBanner: Model<IHeroBanner> =
  mongoose.models.HeroBanner || mongoose.model<IHeroBanner>('HeroBanner', HeroBannerSchema);
