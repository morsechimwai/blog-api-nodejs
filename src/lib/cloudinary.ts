import { v2 as cloudinary } from 'cloudinary';

// Custom modules
import config from '@/config';
import { logger } from '@/lib/winston';

// Types
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
	cloud_name: config.CLOUDINARY_CLOUD_NAME,
	api_key: config.CLOUDINARY_API_KEY,
	api_secret: config.CLOUDINARY_API_SECRET,
	secure: config.NODE_ENV === 'production',
});

// Function to upload image to Cloudinary
const uploadToCloudinary = (
	buffer: Buffer<ArrayBufferLike>, // Buffer containing the image data
	publicId?: string, // Optional public ID to overwrite existing image
): Promise<UploadApiResponse | undefined> => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					allowed_formats: ['png', 'jpg', 'webp'],
					resource_type: 'image',
					folder: 'blog-api/banners',
					public_id: publicId,
					transformation: { quality: 'auto' },
				},
				(error, result) => {
					// Callback after upload
					if (error) {
						logger.error(`Error uploading to Cloudinary: ${error}`);
						reject(error);
					}
					resolve(result);
				},
			)
			.end(buffer);
	});
};

export default uploadToCloudinary;
