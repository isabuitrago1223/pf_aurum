import { cloudinary } from '../config/cloudinary.js';

interface UploadImageOptions {
  folder?: string;
}

export const uploadImageToCloudinary = (
  buffer: Buffer,
  options: UploadImageOptions = {}
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? 'aurum',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary no devolvio un resultado.'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(buffer);
  });
};