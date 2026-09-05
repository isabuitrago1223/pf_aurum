import type { Request, Response } from 'express';

import { uploadImageToCloudinary } from '../services/cloudinary.service.js';
import { AppError } from '../utils/app-error.js';

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError(400, 'Debes enviar una imagen.');
  }

  const result = await uploadImageToCloudinary(req.file.buffer, {
    folder: 'aurum'
  });

  return res.status(201).json({
    image: {
      url: result.url,
      publicId: result.publicId
    }
  });
}
