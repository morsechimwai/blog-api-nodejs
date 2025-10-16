import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import User from '@/models/user';
import Blog from '@/models/blog';

// Types
import { Request, Response } from 'express';
import { IBlog } from '@/models/blog';

type BlogData = Partial<Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>>;

// Purify the blog content
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const updateBlog = async (req: Request, res: Response) => {
	try {
		// Extract blog data from request body
	const { title, content, banner, status: blogStatus } = req.body as BlogData;

		// Get user ID from request (set by authenticate middleware)
		const userId = req.userId;
		const blogId = req.params.blogId;

		// Fetch user and blog from database
		const user = await User.findById(userId).select('role').lean().exec();
		const blog = await Blog.findById(blogId).select('-__v').exec();

		// Check if user exists
		if (!blog) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the blog you are trying to update.',
				type: 'resource_error',
			});
			return;
		}

		if (blog.author !== userId && user?.role !== 'admin') {
			response(res, STATUS.FORBIDDEN, {
				code: 'permission_denied',
				message:
					"You don't have permission to update this blog. Please contact an admin if you need access.",
				type: 'authorization_error',
			});

			logger.warn(`A user tried to update a blog without permission`, {
				userId,
				blog,
			});
			return;
		}

		if (title) blog.title = title;
		if (content) {
			// Sanitize the blog content to prevent XSS attacks
			const cleanContent = purify.sanitize(content);
			blog.content = cleanContent;
		}
		if (banner) blog.banner = banner;
		if (blogStatus) blog.status = blogStatus;

		// Save the updated blog to the database
		await blog.save();
		logger.info(`Blog updated`, { blog });

		response(res, STATUS.OK, {
			code: 'success',
			message: 'Blog updated successfully.',
			type: 'success',
			data: {
				blog,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while updating the blog.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while updating blog: ${error}`);
	}
};

export default updateBlog;
