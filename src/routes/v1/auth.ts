import { Router } from 'express';
import { body, cookie } from 'express-validator';
import bcrypt from 'bcrypt';

// Controllers
import register from '@/controllers/v1/auth/register';
import login from '@/controllers/v1/auth/login';
import refreshToken from '@/controllers/v1/auth/refresh-token';
import logout from '@/controllers/v1/auth/logout';

// Middlewares
import validationError from '@/middlewares/validation-error';

// Models
import User from '@/models/user';
import authenticate from '@/middlewares/authenticate';

// Initialize router
const router = Router();

// Registration route
router.post(
	'/register',
	body('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isLength({ max: 50 })
		.withMessage('Email must be at most 50 characters')
		.isEmail()
		.withMessage('Invalid email address')
		.custom(async (value) => {
			// ตรวจสอบว่ามีผู้ใช้ที่มีอีเมลนี้อยู่แล้วหรือไม่
			const userExists = await User.exists({ email: value });
			// ถ้ามีผู้ใช้ที่มีอีเมลนี้อยู่แล้ว ให้โยนข้อผิดพลาด
			if (userExists) {
				throw new Error('User already exists');
			}
		}),
	body('password')
		.notEmpty()
		.withMessage('Password is required')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long'),
	body('role')
		.optional()
		.isString()
		.withMessage('Role must be a string')
		.isIn(['admin', 'user'])
		.withMessage('Role must be either admin or user'),
	validationError, // Middleware to handle validation errors ตัวกลางสำหรับจัดการข้อผิดพลาดในการตรวจสอบข้อมูล
	register,
);

// Login route
router.post(
	'/login',
	body('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isLength({ max: 50 })
		.withMessage('Email must be at most 50 characters')
		.isEmail()
		.withMessage('Invalid email address')
		.custom(async (value) => {
			// ตรวจสอบว่ามีผู้ใช้ที่มีอีเมลนี้อยู่ในระบบหรือไม่
			const userExists = await User.exists({ email: value });

			// ถ้าไม่มีผู้ใช้ที่มีอีเมลนี้อยู่ในระบบ ให้โยนข้อผิดพลาด
			if (!userExists) {
				throw new Error('User email or password is invalid');
			}
		}),
	body('password')
		.notEmpty()
		.withMessage('Password is required')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.custom(async (value, { req }) => {
			const { email } = req.body as { email: string };
			const user = await User.findOne({ email }) // Find user by email
				.select('password') // Select only the password field
				.lean() // เปลี่ยนจาก Mongoose Document เป็น JavaScript object ธรรมดา
				.exec(); // Execute the query

			if (!user) {
				throw new Error('User email or password is invalid');
			}

			const passwordMatch = await bcrypt.compare(value, user.password);
			if (!passwordMatch) {
				throw new Error('User email or password is invalid');
			}
		}),
	validationError,
	login,
);

// Refresh token route
router.post(
	'/refresh-token',
	cookie('refreshToken')
		.notEmpty()
		.withMessage('Refresh token is required')
		.isJWT()
		.withMessage('Invalid refresh token'),
	validationError,
	refreshToken,
);

router.post('/logout', authenticate, logout);

export default router;
