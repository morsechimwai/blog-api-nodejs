// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import User from '@/models/user';
import Blog from '@/models/blog';

// Types
import { Request, Response } from 'express';

interface QueryType {
	status?: 'draft' | 'published';
}

const getBlogsBySlug = async (req: Request, res: Response) => {
	try {
		// Get user ID from request (set by authenticate middleware)
		const userId = req.userId;

		// Get slug from request parameters
		const slug = req.params.slug;

		//  Determine user role to filter blogs accordingly
		const user = await User.findById(userId).select('role').lean().exec();

		// Build query object
		const blog = await Blog.findOne({ slug })
			.select('-banners.publicId -__v') // Exclude banners' publicId and __v field
			.populate('author', '-createdAt -updatedAt -__v') // Join with User collection, exclude timestamps and __v
			.lean()
			.exec();

		// If blog not found, return 404
		if (!blog) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find a blog with that slug.',
				type: 'resource_error',
			});
			return;
		}

		// If the blog is a draft and the user is not an admin, deny access
		if (user?.role === 'user' && blog.status === 'draft') {
			response(res, STATUS.FORBIDDEN, {
				code: 'permission_denied',
				message:
					"This blog is currently in draft. Please contact an admin if you need access.",
				type: 'authorization_error',
			});

			logger.warn(`A user tried to access a draft blog: ${slug}`);
			return;
		}

		response(res, STATUS.OK, {
			code: 'success',
			message: 'Blog fetched successfully.',
			type: 'success',
			data: {
				blog,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while fetching the blog.',
			type: 'server_error',
			error: error,
		});
		logger.error(`Error while getting blogs by slug: ${error}`);
	}
};

export default getBlogsBySlug;
