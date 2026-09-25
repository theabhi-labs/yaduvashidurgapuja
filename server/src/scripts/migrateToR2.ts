import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, isR2Configured } from '../config/r2';
import { ENV } from '../config/env';
import { Memory } from '../models/Memory';
import { CommitteeMember } from '../models/CommitteeMember';
import { User } from '../models/User';
import { logger } from '../utils/logger';

async function migrateToR2() {
  console.log('\n==================================================');
  console.log('🚀 Starting One-Time Migration: Local Disk -> Cloudflare R2');
  console.log('==================================================\n');

  if (!isR2Configured) {
    console.error('❌ ERROR: Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not set in .env!');
    process.exit(1);
  }

  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(ENV.MONGODB_URI);
  console.log('✅ MongoDB Connected successfully.\n');

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const subDirs = ['memories', 'thumbnails', 'committee', 'avatars'];

  let totalFilesUploaded = 0;
  let totalRecordsUpdated = 0;

  // 1. Upload disk files to R2
  for (const sub of subDirs) {
    const dirPath = path.join(uploadsDir, sub);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.startsWith('.') || file === '.gitkeep') continue;

      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;

      const buffer = fs.readFileSync(filePath);
      const key = `${sub}/${file}`;

      console.log(`Uploading: ${key} (${(buffer.length / 1024).toFixed(1)} KB)...`);
      await r2Client.send(
        new PutObjectCommand({
          Bucket: ENV.R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );
      totalFilesUploaded++;
    }
  }

  console.log(`\n✅ Uploaded ${totalFilesUploaded} files to Cloudflare R2.\n`);

  // 2. Update Memory documents in MongoDB
  const memories = await Memory.find({});
  for (const memory of memories) {
    let updated = false;

    if (memory.imageUrl && memory.imageUrl.startsWith('/uploads/')) {
      const filename = memory.imageUrl.replace(/^\/uploads\/(memories\/)?/, '');
      const key = `memories/${filename}`;
      memory.imageUrl = ENV.R2_PUBLIC_URL
        ? `${ENV.R2_PUBLIC_URL}/${key}`
        : `https://${ENV.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
      updated = true;
    }

    if (memory.thumbnailUrl && memory.thumbnailUrl.startsWith('/uploads/')) {
      const filename = memory.thumbnailUrl.replace(/^\/uploads\/(thumbnails\/)?/, '');
      const key = `thumbnails/${filename}`;
      memory.thumbnailUrl = ENV.R2_PUBLIC_URL
        ? `${ENV.R2_PUBLIC_URL}/${key}`
        : `https://${ENV.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
      updated = true;
    }

    if (updated) {
      await memory.save();
      totalRecordsUpdated++;
    }
  }

  // 3. Update Committee Member documents in MongoDB
  const committee = await CommitteeMember.find({});
  for (const member of committee) {
    if (member.photoUrl && member.photoUrl.startsWith('/uploads/')) {
      const filename = member.photoUrl.replace(/^\/uploads\/(committee\/)?/, '');
      const key = `committee/${filename}`;
      member.photoUrl = ENV.R2_PUBLIC_URL
        ? `${ENV.R2_PUBLIC_URL}/${key}`
        : `https://${ENV.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
      await member.save();
      totalRecordsUpdated++;
    }
  }

  // 4. Update User avatars in MongoDB
  const users = await User.find({ avatar: { $regex: '^/uploads/' } });
  for (const user of users) {
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const filename = user.avatar.replace(/^\/uploads\/(avatars\/)?/, '');
      const key = `avatars/${filename}`;
      user.avatar = ENV.R2_PUBLIC_URL
        ? `${ENV.R2_PUBLIC_URL}/${key}`
        : `https://${ENV.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
      await user.save();
      totalRecordsUpdated++;
    }
  }

  console.log(`✅ Updated ${totalRecordsUpdated} MongoDB documents with new R2 URLs.`);
  console.log('\n==================================================');
  console.log('🎉 Migration Completed Successfully!');
  console.log('==================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

migrateToR2().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
