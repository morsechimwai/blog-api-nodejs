import { Router } from 'express';
import { param, query, body } from 'express-validator';

// Middlewares
import authenticate from '@/middlewares/authenticate';
import validationError from '@/middlewares/validation-error';
import authorize from '@/middlewares/authorize';

// Controllers
import getCurrentUser from '@/controllers/v1/user/get-current-user';
import updateCurrentUser from '@/controllers/v1/user/update-current-user';
import deleteCurrentUser from '@/controllers/v1/user/delete-current-user';
import getAllUser from '@/controllers/v1/user/get-all-user';
import getUser from '@/controllers/v1/user/get-user';
import deleteUser from '@/controllers/v1/user/delete-user';

// Models
import User from '@/models/user';

const router = Router();

// Get current user
router.get(
	'/current',
	authenticate,
	authorize(['admin', 'user']),
	getCurrentUser,
);

// Update current user
router.put(
	'/current',
	authenticate,
	authorize(['admin', 'user']),
	body('username')
		.optional()
		.trim()
		.isLength({ max: 20 })
		.withMessage('Username must be at most 20 characters')
		.custom(async (value) => {
			// Check if username already exists
			const userExists = await User.exists({ username: value });
			if (userExists) {
				throw new Error('The username is already in use');
			}
		}),
	body('email')
		.optional()
		.isLength({ max: 50 })
		.withMessage('Email must be at most 50 characters')
		.isEmail()
		.withMessage('Invalid email address')
		.custom(async (value) => {
			// Check if email already exists
			const emailExists = await User.exists({ email: value });
			if (emailExists) {
				throw new Error('The email is already in use');
			}
		}),
	body('password')
		.optional()
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long'),
	body('firstName')
		.optional()
		.isLength({ max: 20 })
		.withMessage('First name must be at most 20 characters'),
	body('lastName')
		.optional()
		.isLength({ max: 20 })
		.withMessage('Last name must be at most 20 characters'),
	body(['website', 'facebook', 'instagram', 'x', 'youtube'])
		.optional()
		.isURL()
		.withMessage('Invalid URL')
		.isLength({ max: 100 })
		.withMessage('URL must be at most 100 characters'),
	validationError,
	updateCurrentUser,
);

// Delete current user
router.delete(
	'/current',
	authenticate,
	authorize(['admin', 'user']),
	deleteCurrentUser,
);

// Get all users (admin only)
router.get(
	'/',
	authenticate,
	authorize(['admin']),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 50 })
		.withMessage('Limit must be an integer between 1 and 50'),
	query('offset')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Offset must be a positive integer'),
	validationError,
	getAllUser,
);

// Get user by ID (admin only)
router.get(
	'/:userId',
	authenticate,
	authorize(['admin']),
	param('userId').notEmpty().isMongoId().withMessage('Invalid user ID'),
	validationError,
	getUser,
);

// Delete user by ID (admin only)
router.delete(
	'/:userId',
	authenticate,
	authorize(['admin']),
	param('userId').notEmpty().isMongoId().withMessage('Invalid user ID'),
	validationError,
	deleteUser,
);

export default router;
