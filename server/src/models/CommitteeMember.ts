import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICommitteeMember extends Document {
  name: string;
  photoUrl: string;
  designation: string;
  bio?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommitteeMemberSchema = new Schema<ICommitteeMember>(
  {
    name: {
      type: String,
      required: [true, 'सदस्य का नाम आवश्यक है'],
      trim: true,
      maxlength: [100, 'नाम 100 अक्षरों से अधिक नहीं हो सकता'],
    },
    photoUrl: {
      type: String,
      required: [true, 'फोटो आवश्यक है'],
    },
    designation: {
      type: String,
      required: [true, 'पद (Designation) आवश्यक है'],
      trim: true,
      maxlength: [100, 'पद 100 अक्षरों से अधिक नहीं हो सकता'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [400, 'परिचय 400 अक्षरों से अधिक नहीं हो सकता'],
      default: '',
    },
    displayOrder: {
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
      transform(_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

CommitteeMemberSchema.index({ isActive: 1, displayOrder: 1 });

export const CommitteeMember: Model<ICommitteeMember> = mongoose.model<ICommitteeMember>(
  'CommitteeMember',
  CommitteeMemberSchema
);
