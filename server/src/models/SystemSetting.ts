import { Schema, model, Document } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  isDonationEnabled: boolean;
  isLiveChatEnabled: boolean;
  announcement?: string;
  updatedBy?: string;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, default: 'global_config' },
    isDonationEnabled: { type: Boolean, default: true },
    isLiveChatEnabled: { type: Boolean, default: true },
    announcement: { type: String, trim: true },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const SystemSetting = model<ISystemSetting>('SystemSetting', systemSettingSchema);
export default SystemSetting;
