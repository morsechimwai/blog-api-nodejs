import { Router } from 'express';
import { body, param } from 'express-validator';

// Middlewares
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validation-error';

// Controllers
import likeBlog from '@/controllers/v1/like/like-blog';
import unlikeBlog from '@/controllers/v1/like/unlike-blog';

// Initialize router
const router = Router();

// Like a blog
router.post(
	'/blog/:blogId',
	authenticate,
	authorize(['admin', 'user']),
	param('blogId').isMongoId().withMessage('Invalid blog ID'),
	body('userId')
		.notEmpty()
		.withMessage('User ID is required')
		.isMongoId()
		.withMessage('Invalid user ID'),
	validationError,
	likeBlog,
);

// Unlike a blog
router.delete(
	'/blog/:blogId',
	authenticate,
	authorize(['admin', 'user']),
	param('blogId').isMongoId().withMessage('Invalid blog ID'),
	body('userId')
		.notEmpty()
		.withMessage('User ID is required')
		.isMongoId()
		.withMessage('Invalid user ID'),
	validationError,
	unlikeBlog,
);

export default router;
