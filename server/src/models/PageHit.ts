import mongoose, { Document, Schema } from 'mongoose';

export interface IPageHit extends Document {
  date: string; // YYYY-MM-DD
  path: string; // e.g. '/', '/live-darshan', '/memories'
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const pageHitSchema = new Schema<IPageHit>(
  {
    date: {
      type: String,
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so each path has 1 record per date
pageHitSchema.index({ date: 1, path: 1 }, { unique: true });

// TTL index to automatically clean up after 90 days
pageHitSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 } // 90 days
);

export const PageHit = mongoose.model<IPageHit>('PageHit', pageHitSchema);
