import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitorSession extends Document {
  visitorId: string;
  ipHash: string;
  date: string; // YYYY-MM-DD
  path: string;
  lastActive: Date;
  firstSeen: Date;
  pageViews: number;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const visitorSessionSchema = new Schema<IVisitorSession>(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    ipHash: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    path: {
      type: String,
      default: '/',
      trim: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    pageViews: {
      type: Number,
      default: 1,
      min: 1,
    },
    userAgent: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 unique session record per visitor per day
visitorSessionSchema.index({ visitorId: 1, date: 1 }, { unique: true });

export const VisitorSession = mongoose.model<IVisitorSession>('VisitorSession', visitorSessionSchema);

