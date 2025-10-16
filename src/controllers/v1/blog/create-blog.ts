import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import Blog from '@/models/blog';

// Types
import { Request, Response } from 'express';
import { IBlog } from '@/models/blog';

type BlogData = Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>;

// Purify the blog content
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const createBlog = async (req: Request, res: Response) => {
	try {
		// Extract blog data from request body
		const { title, content, banner, status } = req.body as BlogData;

		// Get user ID from request (set by authenticate middleware)
		const userId = req.userId;

		// Sanitize the blog content to prevent XSS attacks
		const cleanContent = purify.sanitize(content);

		// Create a new blog entry in the database
		const newBlog = await Blog.create({
			title,
			content: cleanContent,
			banner,
			status,
			author: userId,
		});

		// Log the creation of the new blog
		logger.info(`New blog created`, newBlog);

		// Respond with the newly created blog
		response(res, STATUS.CREATED, {
			code: 'created',
			message: 'Blog created successfully.',
			type: 'success',
			data: {
				blog: newBlog,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while creating the blog.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while creating blog: ${error}`);
	}
};

export default createBlog;
