import multer from 'multer';

import { AppError } from '../utils/app-error.js';
const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new AppError(400, 'El archivo debe ser una imagen.'));
      return;
    }

    callback(null, true);
  }
});
