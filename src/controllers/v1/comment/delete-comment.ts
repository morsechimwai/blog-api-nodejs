// Custom modules
import { logger } from '@/lib/winston';

// Models
import Comment from '@/models/comment';
import User from '@/models/user';
import Blog from '@/models/blog';

// Types
import type { Request, Response } from 'express';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

const deleteComment = async (req: Request, res: Response) => {
	const currentUserId = req.userId;
	const { commentId } = req.params;
	try {
		const comment = await Comment.findById(commentId)
			.select('userId blogId')
			.lean()
			.exec();
		const user = await User.findById(currentUserId).select('role').exec();

		if (!comment) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the comment you are trying to delete.',
				type: 'resource_error',
			});
			return;
		}

		const blog = await Blog.findById(comment.blogId)
			.select('commentsCount')
			.exec();

		if (!blog) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the associated blog.',
				type: 'resource_error',
			});
			return;
		}

		if (comment.userId !== currentUserId && user?.role !== 'admin') {
			response(res, STATUS.FORBIDDEN, {
				code: 'permission_denied',
				message:
					"You don't have permission to remove this comment. Please contact an admin if this seems wrong.",
				type: 'authorization_error',
			});

			logger.warn(`A user tried to delete a comment without permission`, {
				userId: currentUserId,
				comment,
			});
			return;
		}

		await Comment.deleteOne({ _id: commentId });

		logger.info('Comment deleted successfully', {
			commentId,
		});

		blog.commentsCount--;
		await blog.save();

		logger.info('Blog comments count updated', {
			blogId: blog._id,
			commentsCount: blog.commentsCount,
		});

		response(res, STATUS.NO_CONTENT, {
			code: 'success',
			message: 'Comment deleted successfully.',
			type: 'success',
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while deleting the comment.',
			type: 'server_error',
			error: error,
		});

		logger.error('Error deleting comment', error);
	}
};

export default deleteComment;
