import { Router } from 'express';
import { param, query, body } from 'express-validator';
import multer from 'multer';

// Middlewares
import authenticate from '@/middlewares/authenticate';
import validationError from '@/middlewares/validation-error';
import authorize from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/upload-blog-banner';

// Controllers
import createBlog from '@/controllers/v1/blog/create-blog';
import getAllBlogs from '@/controllers/v1/blog/get-all-blogs';
import getBlogsByUser from '@/controllers/v1/blog/get-blogs-by-user';
import getBlogsBySlug from '@/controllers/v1/blog/get-blog-by-slug';
import updateBlog from '@/controllers/v1/blog/update-blog';
import deleteBlog from '@/controllers/v1/blog/delete-blog';

// Initialize router
const router = Router();

// Multer setup for handling multipart/form-data (file uploads)
const upload = multer();

// Create a new blog
router.post(
	'/',
	authenticate,
	authorize(['admin']),
	upload.single('banner_image'),
	body('title')
		.trim()
		.notEmpty()
		.withMessage('Title is required')
		.isLength({ max: 180 })
		.withMessage('Title must be less than 180 characters'),
	body('content').trim().notEmpty().withMessage('Content is required'),
	body('status')
		.optional()
		.isIn(['draft', 'published'])
		.withMessage('Status must be one of the value, draft or published'),
	validationError,
	uploadBlogBanner('post'),
	createBlog,
);

// Get all blogs with pagination
router.get(
	'/',
	authenticate,
	authorize(['admin', 'user']),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('Limit must be between 1 and 100'),
	validationError,
	getAllBlogs,
);

// Get blogs by user ID with pagination
router.get(
	'/user/:userId',
	authenticate,
	authorize(['admin', 'user']),
	param('userId').isMongoId().withMessage('Invalid user ID'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 50 })
		.withMessage('Limit must be between 1 and 50'),
	query('offset')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Offset must be a positive integer'),
	param('userId').isMongoId().withMessage('Invalid user ID'),
	validationError,
	getBlogsByUser,
);

// Get a blog by slug
router.get(
	'/:slug',
	authenticate,
	authorize(['admin', 'user']),
	param('slug').notEmpty().withMessage('Slug is required'),
	validationError,
	getBlogsBySlug,
);

router.put(
	'/:blogId',
	authenticate,
	authorize(['admin']),
	param('blogId').isMongoId().withMessage('Invalid blog ID'),
	upload.single('banner_image'),
	body('title')
		.optional()
		.isLength({ max: 180 })
		.withMessage('Title must be less than 180 characters'),
	body('content'),
	body('status')
		.optional()
		.isIn(['draft', 'published'])
		.withMessage('Status must be one of the value, draft or published'),
	validationError,
	uploadBlogBanner('put'),
	updateBlog,
);

router.delete('/:blogId', authenticate, authorize(['admin']), deleteBlog);

export default router;
