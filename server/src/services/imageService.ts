import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { ApiError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export interface ProcessedImages {
  imageUrl: string;
  thumbnailUrl: string;
}

export class ImageService {
  private static baseUploadDir = path.resolve(process.cwd(), 'uploads');

  /**
   * Ensure upload subdirectories exist
   */
  public static ensureUploadDirs() {
    const dirs = [
      this.baseUploadDir,
      path.join(this.baseUploadDir, 'memories'),
      path.join(this.baseUploadDir, 'thumbnails'),
      path.join(this.baseUploadDir, 'committee'),
      path.join(this.baseUploadDir, 'avatars'),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Process and optimize a memory image:
   * 1. Inspect buffer with Sharp (verifies actual image integrity)
   * 2. Strip all EXIF / GPS metadata
   * 3. Generate high-res WebP (max width 1920px, q: 85)
   * 4. Generate optimized thumbnail WebP (max width 450px, q: 80)
   */
  public static async processMemoryImage(buffer: Buffer): Promise<ProcessedImages> {
    this.ensureUploadDirs();

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
        throw new ApiError(400, 'अमान्य चित्र प्रारूप (Invalid image format)');
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const mainFilename = `memory-${fileId}.webp`;
      const thumbFilename = `thumb-${fileId}.webp`;

      const mainFilePath = path.join(this.baseUploadDir, 'memories', mainFilename);
      const thumbFilePath = path.join(this.baseUploadDir, 'thumbnails', thumbFilename);

      // Process main image (strip metadata, resize if larger than 1920, convert to webp)
      await sharp(buffer)
        .rotate() // auto-orient based on EXIF before stripping
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toFile(mainFilePath);

      // Process thumbnail image
      await sharp(buffer)
        .rotate()
        .resize({ width: 500, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(thumbFilePath);

      return {
        imageUrl: `/uploads/memories/${mainFilename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbFilename}`,
      };
    } catch (error: any) {
      logger.error('Error processing memory image:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'चित्र को संसाधित करने में त्रुटि हुई, कृपया वैध छवि चुनें');
    }
  }

  /**
   * Process a single portrait for Committee Member or Avatar
   */
  public static async processPortrait(
    buffer: Buffer,
    folder: 'committee' | 'avatars'
  ): Promise<string> {
    this.ensureUploadDirs();

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
        throw new ApiError(400, 'अमान्य चित्र प्रारूप');
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const filename = `${folder}-${fileId}.webp`;
      const targetPath = path.join(this.baseUploadDir, folder, filename);

      // Square / portrait crop optimized WebP (600x600, q: 85)
      await sharp(buffer)
        .rotate()
        .resize({ width: 600, height: 600, fit: 'cover', position: 'top' })
        .webp({ quality: 85 })
        .toFile(targetPath);

      return `/uploads/${folder}/${filename}`;
    } catch (error: any) {
      logger.error(`Error processing ${folder} image:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'चित्र को संसाधित करने में त्रुटि हुई');
    }
  }

  /**
   * Delete image files from disk when memory is deleted
   */
  public static async deleteImageFiles(imageUrls: string[]): Promise<void> {
    for (const imgUrl of imageUrls) {
      if (!imgUrl || !imgUrl.startsWith('/uploads/')) continue;
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
