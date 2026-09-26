import { Schema, model, Document, Types } from 'mongoose';

export type DonationStatus = 'created' | 'paid' | 'failed';
export type DonationType = 'donation' | 'dakshina';

export interface IDonation extends Document {
  donorName: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: DonationStatus;
  type: DonationType;
  liveSessionRoomName?: string;
  user?: Types.ObjectId;
  isAnonymous: boolean;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    donorName: { type: String, default: 'श्रद्धालु', trim: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, sparse: true },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
      index: true,
    },
    type: {
      type: String,
      enum: ['donation', 'dakshina'],
      default: 'donation',
      index: true,
    },
    liveSessionRoomName: { type: String, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    isAnonymous: { type: Boolean, default: false },
    message: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

export const Donation = model<IDonation>('Donation', donationSchema);
export default Donation;

