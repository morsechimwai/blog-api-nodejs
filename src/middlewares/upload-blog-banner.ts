// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';
import uploadToCloudinary from '@/lib/cloudinary';

// Models
import Blog from '@/models/blog';

// Types
import { Request, Response, NextFunction } from 'express';
import { UploadApiErrorResponse } from 'cloudinary';

// Constants
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Middleware to handle blog banner upload
const uploadBlogBanner = (method: 'post' | 'put') => {
	return async (req: Request, res: Response, next: NextFunction) => {
		// For PUT requests (editing), if no file is uploaded, skip the upload process
		if (method === 'put' && !req.file) {
			next();
			return;
		}

		// No file uploaded (creating new blog)
		if (!req.file) {
			response(res, STATUS.BAD_REQUEST, {
				code: 'validation_failed',
				message: 'Please include a banner image before continuing.',
				type: 'validation_error',
			});
			return;
		}

		// File size exceeds limit
		if (req.file.size > MAX_FILE_SIZE) {
			response(
				res,
				STATUS.PAYLOAD_TOO_LARGE,
				{
					code: 'validation_failed',
					message: 'Blog banner must be smaller than 2MB.',
					type: 'validation_error',
				},
			);
			return;
		}

		try {
			// For PUT requests, fetch the existing blog to get the current banner's publicId
			const { blogId } = req.params;

			// If blogId is not provided in PUT request, return error
			const blog = await Blog.findById(blogId).select('banner.publicId').exec();

			// Upload the image to Cloudinary
			const data = await uploadToCloudinary(
				req.file.buffer,
				blog?.banner.publicId.replace('blog-api/banners/', ''),
			);

			// Upload failed
			if (!data) {
				response(res, STATUS.INTERNAL_SERVER_ERROR, {
					code: 'internal_error',
					message: 'Something went wrong while uploading the blog banner.',
					type: 'server_error',
				});

				logger.error('Error while uploading blog banner to Cloudinary', {
					blogId,
					publicId: blog?.banner.publicId,
				});
				return;
			}

			// Prepare the new banner data
			const newBanner = {
				publicId: data.public_id,
				url: data.secure_url,
				width: data.width,
				height: data.height,
			};

			logger.info('Blog banner uploaded to Cloudinary', {
				blogId,
				banner: newBanner,
			});

			// Attach the new banner data to the request body for further processing
			req.body.banner = newBanner;
			next();
		} catch (error: UploadApiErrorResponse | any) {
			// Handle Cloudinary upload errors
			const isClientError = error.http_code < 500;
			response(
				res,
				isClientError ? STATUS.BAD_REQUEST : STATUS.INTERNAL_SERVER_ERROR,
				{
					code: isClientError ? 'validation_failed' : 'internal_error',
					message:
						typeof error.message === 'string'
							? error.message
							: 'We could not upload the blog banner right now.',
					type: isClientError ? 'validation_error' : 'server_error',
					detail: !isClientError ? error?.name : undefined,
				},
			);

			logger.error(`Error while uploading blog banner to Cloudinary ${error}`);
		}
	};
};

export default uploadBlogBanner;
