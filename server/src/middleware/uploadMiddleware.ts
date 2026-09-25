import multer from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/apiResponse';
import { ENV } from '../config/env';

// Use MemoryStorage so that Sharp can process the buffer directly before saving to disk or cloud
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'केवल JPG, JPEG, PNG और WebP चित्र ही अपलोड किए जा सकते हैं'
      )
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter,
});
