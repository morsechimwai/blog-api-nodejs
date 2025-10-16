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

const getAllBlogs = async (req: Request, res: Response) => {
	try {
		// Get user ID from request (set by authenticate middleware)
		const userId = req.userId;

		// Pagination parameters
		const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
		const offset =
			parseInt(req.query.offset as string) || config.defaultResOffset;

		// Determine user role to filter blogs accordingly
		const user = await User.findById(userId).select('role').lean().exec();

		// Build query object
		const query: QueryType = {};

		// Show only published blogs to non-admin users
		if (user?.role === 'user') {
			query.status = 'published';
		}

		// Get total count of blogs
		const total = await Blog.countDocuments(query);

		// Fetch blogs with pagination and author details
		const blogs = await Blog.find(query)
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
			message: 'Something went wrong while fetching blogs.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while fetching blogs: ${error}`);
	}
};

export default getAllBlogs;
