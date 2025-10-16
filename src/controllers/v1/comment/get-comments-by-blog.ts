// Custom modules
import { logger } from '@/lib/winston';
import { STATUS } from '@/utils/http-status';
import { response } from '@/utils/response';

// Models
import Blog from '@/models/blog';
import Comment from '@/models/comment';

// Types
import type { Request, Response } from 'express';

const getCommentsByBlog = async (req: Request, res: Response) => {
	const { blogId } = req.params;

	try {
		const blog = await Blog.findById(blogId).select('_id').exec();

		if (!blog) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the requested blog.',
				type: 'resource_error',
			});
			return;
		}

		const allComments = await Comment.find({ blogId })
			.sort({ createdAt: -1 })
			.lean()
			.exec();

		response(res, STATUS.OK, {
			code: 'success',
			message: 'Comments fetched successfully.',
			type: 'success',
			data: {
				comments: allComments,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while fetching comments.',
			type: 'server_error',
			error: error,
		});

		logger.error('Error fetching comments for blog', { error, blogId });
	}
};

export default getCommentsByBlog;
