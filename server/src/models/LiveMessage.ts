import { Schema, model, Document, Types } from 'mongoose';

export interface ILiveMessage extends Document {
  roomName: string;
  liveSession?: Types.ObjectId;
  user?: Types.ObjectId;
  name: string;
  username?: string;
  avatar?: string;
  message: string;
  isSuperChat: boolean;
  donationAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const liveMessageSchema = new Schema<ILiveMessage>(
  {
    roomName: { type: String, required: true, index: true },
    liveSession: { type: Schema.Types.ObjectId, ref: 'LiveSession' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, default: 'भक्त', trim: true },
    username: { type: String, trim: true },
    avatar: { type: String, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    isSuperChat: { type: Boolean, default: false, index: true },
    donationAmount: { type: Number },
  },
  { timestamps: true }
);

liveMessageSchema.index({ roomName: 1, createdAt: -1 });

export const LiveMessage = model<ILiveMessage>('LiveMessage', liveMessageSchema);
export default LiveMessage;
