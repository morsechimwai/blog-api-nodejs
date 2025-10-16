// Custom modules
import { logger } from '@/lib/winston';
import config from '@/config';
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

const getBlogsByUser = async (req: Request, res: Response) => {
	try {
		// Get user ID from request parameters
		const userId = req.params.userId;

		// Get current user ID from request
		const currentUserId = req.userId;

		// Pagination parameters
		const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
		const offset =
			parseInt(req.query.offset as string) || config.defaultResOffset;

		const currentUser = await User.findById(currentUserId)
			.select('role')
			.lean()
			.exec();
		const query: QueryType = {};

		if (currentUser?.role === 'user') {
			query.status = 'published';
		}

		// Get total count of blogs by the specified user
		const total = await Blog.countDocuments({ author: userId, ...query });
		const blogs = await Blog.find({ author: userId, ...query })
			.select('-banners.publicId -__v') // Exclude banners' publicId and __v field
			.populate('author', '-createdAt -updatedAt -__v') // Join with User collection, exclude timestamps and __v
			.limit(limit)
			.skip(offset)
			.sort({ createdAt: -1 }) // Sort by creation date (newest first)
			.lean()
			.exec();

		response(res, STATUS.OK, {
			code: 'success',
			message: 'Blogs fetched successfully.',
			type: 'success',
			data: {
				limit,
				offset,
				total,
				blogs,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while fetching blogs for this user.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while getting blogs by user: ${error}`);
	}
};

export default getBlogsByUser;
