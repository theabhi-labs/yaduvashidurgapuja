import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/durgapujakapooripur',
  JWT_SECRET: process.env.JWT_SECRET || 'yaduvashi_durga_puja_secret_key_super_secure_2026_kapooripur',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_EXPIRES_DAYS: parseInt(process.env.COOKIE_EXPIRES_DAYS || '7', 10),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'contact@yaduvashidurgapujakapooripur.online',
  isProduction: process.env.NODE_ENV === 'production',
};
