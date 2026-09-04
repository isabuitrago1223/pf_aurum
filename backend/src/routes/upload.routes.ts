import { Router } from 'express';

import { uploadImage } from '../controllers/upload.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';
import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';
import { uploadImage as uploadImageMiddleware } from '../middlewares/upload.middleware.js';

export const uploadRouter = Router();

uploadRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  uploadImageMiddleware.single('image'),
  asyncHandler(uploadImage)
);