import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, isR2Configured } from '../config/r2';
import { ENV } from '../config/env';
import { ApiError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export interface ProcessedImages {
  imageUrl: string;
  thumbnailUrl: string;
}

export class ImageService {
  private static baseUploadDir = path.resolve(process.cwd(), 'uploads');

  /**
   * Ensure local fallback upload subdirectories exist (for offline/dev environments)
   */
  public static ensureUploadDirs() {
    const dirs = [
      this.baseUploadDir,
      path.join(this.baseUploadDir, 'memories'),
      path.join(this.baseUploadDir, 'thumbnails'),
      path.join(this.baseUploadDir, 'committee'),
      path.join(this.baseUploadDir, 'avatars'),
      path.join(this.baseUploadDir, 'ads'),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Uploads an in-memory buffer directly to Cloudflare R2
   */
  private static async uploadBufferToR2(
    buffer: Buffer,
    key: string,
    contentType: string = 'image/webp'
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: ENV.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await r2Client.send(command);
    const publicUrl = ENV.R2_PUBLIC_URL
      ? `${ENV.R2_PUBLIC_URL}/${key}`
      : `https://${ENV.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;

    logger.info(`[Cloudflare R2] Successfully uploaded: ${key} -> ${publicUrl}`);
    return publicUrl;
  }

  /**
   * Process and optimize a memory image:
   * 1. Inspect buffer with Sharp (verifies binary image integrity)
   * 2. Strip all EXIF / GPS metadata & auto-orient
   * 3. Generate high-res WebP buffer (max width 1920px, q: 85)
   * 4. Generate optimized thumbnail WebP buffer (max width 500px, q: 80)
   * 5. Upload directly to Cloudflare R2 (or local disk in fallback mode)
   */
  public static async processMemoryImage(buffer: Buffer): Promise<ProcessedImages> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
        throw new ApiError(400, 'अमान्य चित्र प्रारूप (केवल JPG, PNG, WebP मान्य हैं)');
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const mainKey = `memories/memory-${fileId}-large.webp`;
      const thumbKey = `memories/thumb-${fileId}.webp`;

      // 1. Compress main HD image to WebP buffer (strip metadata, resize if larger than 1920px)
      const mainBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      // 2. Compress thumbnail image to WebP buffer (max 500px, q: 80)
      const thumbBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 500, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      // 3. Upload to Cloudflare R2 if configured
      if (isR2Configured) {
        const [imageUrl, thumbnailUrl] = await Promise.all([
          this.uploadBufferToR2(mainBuffer, mainKey, 'image/webp'),
          this.uploadBufferToR2(thumbBuffer, thumbKey, 'image/webp'),
        ]);

        return { imageUrl, thumbnailUrl };
      }

      // Fallback: Save to local disk if R2 credentials are not yet set in dev
      this.ensureUploadDirs();
      const mainFilePath = path.join(this.baseUploadDir, 'memories', `memory-${fileId}.webp`);
      const thumbFilePath = path.join(this.baseUploadDir, 'thumbnails', `thumb-${fileId}.webp`);

      await Promise.all([
        fs.promises.writeFile(mainFilePath, mainBuffer),
        fs.promises.writeFile(thumbFilePath, thumbBuffer),
      ]);

      return {
        imageUrl: `/uploads/memories/memory-${fileId}.webp`,
        thumbnailUrl: `/uploads/thumbnails/thumb-${fileId}.webp`,
      };
    } catch (error: any) {
      logger.error('Error processing memory image for R2:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'चित्र को संसाधित करने में त्रुटि हुई, कृपया वैध छवि चुनें');
    }
  }

  /**
   * Process in-feed Ad banner image and upload to Cloudflare R2 or local disk
   * High-quality WebP, auto-oriented, max width 1200px (q: 85)
   */
  public static async processAdImage(buffer: Buffer): Promise<string> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
        throw new ApiError(400, 'Invalid image format (only JPG, PNG, and WebP are allowed)');
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const key = `ads/ad-${fileId}.webp`;

      const adBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      if (isR2Configured) {
        return await this.uploadBufferToR2(adBuffer, key, 'image/webp');
      }

      // Fallback to local disk
      this.ensureUploadDirs();
      const filename = `ad-${fileId}.webp`;
      const targetPath = path.join(this.baseUploadDir, 'ads', filename);
      await fs.promises.writeFile(targetPath, adBuffer);

      return `/uploads/ads/${filename}`;
    } catch (error: any) {
      logger.error('Error processing ad image:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Failed to process ad image. Please choose a valid image.');
    }
  }

  /**
   * Process a single portrait for Committee Member or Avatar and upload to R2
   */
  public static async processPortrait(
    buffer: Buffer,
    folder: 'committee' | 'avatars'
  ): Promise<string> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
        throw new ApiError(400, 'अमान्य चित्र प्रारूप');
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const key = `${folder}/${folder}-${fileId}.webp`;

      // Square / portrait crop optimized WebP (600x600, q: 85)
      const portraitBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 600, height: 600, fit: 'cover', position: 'top' })
        .webp({ quality: 85 })
        .toBuffer();

      if (isR2Configured) {
        return await this.uploadBufferToR2(portraitBuffer, key, 'image/webp');
      }

      // Fallback to local disk
      this.ensureUploadDirs();
      const filename = `${folder}-${fileId}.webp`;
      const targetPath = path.join(this.baseUploadDir, folder, filename);
      await fs.promises.writeFile(targetPath, portraitBuffer);

      return `/uploads/${folder}/${filename}`;
    } catch (error: any) {
      logger.error(`Error processing ${folder} portrait for R2:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'चित्र को संसाधित करने में त्रुटि हुई');
    }
  }

  /**
   * Delete image files from Cloudflare R2 or local disk when memory/photo is deleted
   */
  public static async deleteImageFiles(imageUrls: string[]): Promise<void> {
    for (const imgUrl of imageUrls) {
      if (!imgUrl) continue;

      // Case 1: Cloudflare R2 URL
      if (
        (ENV.R2_PUBLIC_URL && imgUrl.startsWith(ENV.R2_PUBLIC_URL)) ||
        imgUrl.includes('.r2.cloudflarestorage.com')
      ) {
        try {
          // Extract Key from URL (e.g. "memories/memory-xxx.webp")
          let key = '';
          if (ENV.R2_PUBLIC_URL && imgUrl.startsWith(ENV.R2_PUBLIC_URL)) {
            key = imgUrl.replace(`${ENV.R2_PUBLIC_URL}/`, '');
          } else {
            const urlObj = new URL(imgUrl);
            key = urlObj.pathname.replace(/^\/+/, '');
          }

          if (key && isR2Configured) {
            await r2Client.send(
              new DeleteObjectCommand({
                Bucket: ENV.R2_BUCKET_NAME,
                Key: key,
              })
            );
            logger.info(`[Cloudflare R2] Deleted object: ${key}`);
          }
        } catch (err) {
          logger.warn(`[Cloudflare R2] Failed to delete file ${imgUrl}:`, err);
        }
      }
      // Case 2: Local disk fallback URL (/uploads/...)
      else if (imgUrl.startsWith('/uploads/')) {
        try {
          const relativePath = imgUrl.replace(/^\/uploads\//, '');
          const fullPath = path.join(this.baseUploadDir, relativePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          logger.warn('Failed to delete file from disk:', imgUrl, err);
        }
      }
    }
  }
}

