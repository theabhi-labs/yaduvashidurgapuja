import { S3Client } from '@aws-sdk/client-s3';
import { ENV } from './env';
import { logger } from '../utils/logger';

export const isR2Configured = Boolean(
  ENV.R2_ACCOUNT_ID && ENV.R2_ACCESS_KEY_ID && ENV.R2_SECRET_ACCESS_KEY
);

if (!isR2Configured) {
  logger.warn(
    '[Cloudflare R2] R2 credentials not fully configured in .env. Falling back to local disk or mock storage.'
  );
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ENV.R2_ACCOUNT_ID || 'dummy'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ENV.R2_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: ENV.R2_SECRET_ACCESS_KEY || 'dummy',
  },
});
