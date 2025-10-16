import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import Blog from '@/models/blog';
import Comment from '@/models/comment';

// Types
import { Request, Response } from 'express';
import { IComment } from '@/models/comment';

// Define the shape of the request body for commenting
// สร้าง type ใหม่เพื่อใช้ในการกำหนดชนิดของข้อมูลที่ส่งมาใน body ของคำขอ
type CommentData = Pick<IComment, 'content'>;

// Initialize DOMPurify with JSDOM
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const commentBlog = async (req: Request, res: Response) => {
	const { content } = req.body as CommentData;
	const { blogId } = req.params;
	const userId = req.userId;

	try {
		const blog = await Blog.findById(blogId).select('_id commentsCount').exec();

		if (!blog) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the blog you want to comment on.',
				type: 'resource_error',
			});
			return;
		}

		const cleanContent = purify.sanitize(content);

		const newComment = await Comment.create({
			blogId,
			content: cleanContent,
			userId,
		});

		logger.info(`New comment created`);

		blog.commentsCount++;
		await blog.save();

		logger.info(`Blog comments count updated`, {
			blogId: blog._id,
			commentsCount: blog.commentsCount,
		});

		response(res, STATUS.CREATED, {
			code: 'created',
			message: 'Comment added successfully.',
			type: 'success',
			data: {
				comment: newComment,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while adding the comment.',
			type: 'server_error',
			error: error,
		});

		logger.error('Error commenting on blog:', error);
	}
};

export default commentBlog;
