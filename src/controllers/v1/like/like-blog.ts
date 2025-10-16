// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import Blog from '@/models/blog';
import Like from '@/models/like';

// Types
import { Request, Response } from 'express';

const likeBlog = async (req: Request, res: Response) => {
	const { blogId } = req.params;
	const { userId } = req.body;

	try {
		const blog = await Blog.findById(blogId).select('likesCount').exec();

		if (!blog) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the blog you want to like.',
				type: 'resource_error',
			});
			return;
		}

		const existingLike = await Like.findOne({ blogId, userId }).lean().exec();
		if (existingLike) {
			response(res, STATUS.BAD_REQUEST, {
				code: 'validation_failed',
				message: "You've already liked this blog.",
				type: 'validation_error',
			});
			return;
		}

		await Like.create({ blogId, userId });
		blog.likesCount++;
		await blog.save();

		logger.info(`Blog liked successfully`, {
			userId,
			blogId: blog._id,
			likesCount: blog.likesCount,
		});

		response(res, STATUS.OK, {
			code: 'success',
			message: 'Blog liked successfully.',
			type: 'success',
			data: {
				likesCount: blog.likesCount,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while liking the blog.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while liking a blog: ${error}`);
	}
};

export default likeBlog;
