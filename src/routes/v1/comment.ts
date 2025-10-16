import { Router } from 'express';
import { body, param } from 'express-validator';

// Custom modules
import validationError from '@/middlewares/validation-error';

// Middlewares
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';

// Controllers
import commentBlog from '@/controllers/v1/comment/comment-blog';
import getCommentsByBlog from '@/controllers/v1/comment/get-comments-by-blog';
import deleteComment from '@/controllers/v1/comment/delete-comment';

const router = Router();

// Comment on a blog post
router.post(
	'/blog/:blogId',
	authenticate,
	authorize(['admin', 'user']),
	param('blogId').isMongoId().withMessage('Invalid blog ID'),
	body('content').trim().notEmpty().withMessage('Content is required'),
	validationError,
	commentBlog,
);

// Get comments for a blog post
router.get(
	'/blog/:blogId',
	authenticate,
	authorize(['admin', 'user']),
	param('blogId').isMongoId().withMessage('Invalid blog ID'),
	validationError,
	getCommentsByBlog,
);

router.delete(
	'/:commentId',
	authenticate,
	authorize(['admin', 'user']),
	param('commentId').isMongoId().withMessage('Invalid comment ID'),
	validationError,
	deleteComment,
);

export default router;
