import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPujaSchedule extends Document {
  title: string;
  time: string;
  description?: string;
  isSpecial: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PujaScheduleSchema = new Schema<IPujaSchedule>(
  {
    title: {
      type: String,
      required: [true, 'Puja title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    time: {
      type: String,
      required: [true, 'Puja time is required'],
      trim: true,
      maxlength: [50, 'Time cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

PujaScheduleSchema.index({ isActive: 1, order: 1 });

export const PujaSchedule: Model<IPujaSchedule> =
  mongoose.models.PujaSchedule || mongoose.model<IPujaSchedule>('PujaSchedule', PujaScheduleSchema);
