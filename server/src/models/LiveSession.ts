import { Schema, model, Document, Types } from 'mongoose';

export type LiveSessionStatus = 'live' | 'ended';

export interface ILiveSession extends Document {
  roomName: string;
  hostAdmin: Types.ObjectId;
  hostName: string;
  status: LiveSessionStatus;
  startedAt: Date;
  endedAt?: Date;
  peakViewers: number;
  createdAt: Date;
  updatedAt: Date;
}

const liveSessionSchema = new Schema<ILiveSession>(
  {
    roomName: { type: String, required: true, unique: true, index: true },
    hostAdmin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostName: { type: String, required: true },
    status: { type: String, enum: ['live', 'ended'], default: 'live', index: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    peakViewers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LiveSession = model<ILiveSession>('LiveSession', liveSessionSchema);
export default LiveSession;
