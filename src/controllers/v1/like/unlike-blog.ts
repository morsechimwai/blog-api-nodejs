// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import Blog from '@/models/blog';
import Like from '@/models/like';

// Types
import { Request, Response } from 'express';

const unlikeBlog = async (req: Request, res: Response) => {
	const { blogId } = req.params;
	const { userId } = req.body;

	try {
		const existingLike = await Like.findOne({ blogId, userId }).lean().exec();

		if (!existingLike) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find a like for this blog.',
				type: 'resource_error',
			});
			return;
		}

		await Like.deleteOne({ _id: existingLike._id });

		const blog = await Blog.findById(blogId).select('likesCount').exec();

		if (!blog) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the blog you want to unlike.',
				type: 'resource_error',
			});
			return;
		}

		blog.likesCount--;
		await blog.save();

		logger.info(`Blog unliked successfully`, {
			userId,
			blogId: blog._id,
			likesCount: blog.likesCount,
		});

		response(res, STATUS.NO_CONTENT, {
			code: 'success',
			message: 'Blog unliked successfully.',
			type: 'success',
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while unliking the blog.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while unliking a blog`, error);
	}
};

export default unlikeBlog;
