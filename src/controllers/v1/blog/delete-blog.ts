import { v2 as cloudinary } from 'cloudinary';

// Custom modules
import { logger } from '@/lib/winston';

// Models
import User from '@/models/user';
import Blog from '@/models/blog';

// Types
import { Request, Response } from 'express';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

const deleteBlog = async (req: Request, res: Response) => {
	try {
		const userId = req.userId;
		const blogId = req.params.blogId;

		const user = await User.findById(userId).select('role').lean().exec();
		const blog = await Blog.findById(blogId)
			.select('author banner.publicId')
			.lean()
			.exec();

		if (!blog) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the requested blog.',
				type: 'resource_error',
			});
			return;
		}

		if (blog.author !== userId && user?.role !== 'admin') {
			response(res, STATUS.FORBIDDEN, {
				code: 'permission_denied',
				message:
					"You don't have permission to delete this blog. Reach out to an admin if you need help.",
				type: 'authorization_error',
			});

			logger.warn(`A user tried to delete a blog without permission`, {
				userId,
			});
			return;
		}

		await cloudinary.uploader.destroy(blog.banner.publicId);
		logger.info(`Blog banner image deleted from Cloudinary`, {
			publicId: blog.banner.publicId,
		});

		await Blog.deleteOne({ _id: blogId });
		logger.info(`Blog deleted successfully: ${blogId}`);

		response(res, STATUS.NO_CONTENT, {
			code: 'success',
			message: 'Blog deleted successfully.',
			type: 'success',
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while deleting the blog.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while deleting blog: ${error}`);
	}
};

export default deleteBlog;
