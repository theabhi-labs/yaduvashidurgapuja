import { Schema, model, Document, Types } from 'mongoose';

export type LiveSessionStatus = 'scheduled' | 'live' | 'ended';

export interface ILiveSession extends Document {
  title: string;
  description?: string;
  roomName: string;
  hostAdmin: Types.ObjectId;
  hostName: string;
  status: LiveSessionStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  isChatEnabled: boolean;
  isDonationEnabled: boolean;
  currentViewers: number;
  peakViewers: number;
  createdAt: Date;
  updatedAt: Date;
}

const liveSessionSchema = new Schema<ILiveSession>(
  {
    title: { type: String, required: true, default: 'माँ दुर्गा पावन महाआरती', trim: true },
    description: { type: String, trim: true },
    roomName: { type: String, required: true, unique: true, index: true },
    hostAdmin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostName: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'live',
      index: true,
    },
    scheduledAt: { type: Date },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    isChatEnabled: { type: Boolean, default: true },
    isDonationEnabled: { type: Boolean, default: true },
    currentViewers: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound indexes for optimal queries & broadcast scheduling
liveSessionSchema.index({ status: 1, scheduledAt: 1 });
liveSessionSchema.index({ status: 1, startedAt: -1 });
liveSessionSchema.index({ status: 1, createdAt: -1 });

export const LiveSession = model<ILiveSession>('LiveSession', liveSessionSchema);
export default LiveSession;

