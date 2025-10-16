// Custom modules
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import config from '@/config';
import { genUsername } from '@/utils';

// Models
import User from '@/models/user';
import Token from '@/models/token';

// Types
import type { Request, Response } from 'express';
import { IUser } from '@/models/user';
import token from '@/models/token';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Data type for user registration
// กำหนดชนิดข้อมูลสำหรับการลงทะเบียนผู้ใช้
type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

// Controller for user registration
// ตัวควบคุมสำหรับการลงทะเบียนผู้ใช้
const register = async (req: Request, res: Response): Promise<void> => {
	const { email, password, role } = req.body as UserData; // Extract user data from request body

	if (role === 'admin' && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
		response(res, STATUS.FORBIDDEN, {
			code: 'permission_denied',
			message:
				"You don't have permission to register as an admin with this email.",
			type: 'authorization_error',
		});

		logger.warn(
			`User with email ${email} tried to register as admin but is not in the whitelist`,
		);
		return;
	}

	try {
		const username = genUsername(); // Generate a unique username

		// Create a new user in the database
		const newUser = await User.create({
			username,
			email,
			password,
			role,
		});

		// Generate access token and refresh token for the new user
		const accessToken = generateAccessToken(newUser._id);
		const refreshToken = generateRefreshToken(newUser._id);

		// Store refresh token in db
		await Token.create({ token: refreshToken, userId: newUser._id });
		logger.info('Refresh token created for user', {
			userId: newUser._id,
			token: refreshToken,
		});

		// Set refresh token in HTTP-only cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true, // เพื่อป้องกันการเข้าถึงคุกกี้จากฝั่งไคลเอนต์
			secure: config.NODE_ENV === 'production', // ใช้คุกกี้ที่ปลอดภัยในสภาพแวดล้อม production
			sameSite: 'strict', // ป้องกันการส่งคุกกี้ในคำขอข้ามไซต์
		});

		response(res, STATUS.CREATED, {
			code: 'created',
			message: 'User registered successfully.',
			type: 'success',
			data: {
				user: {
					username: newUser.username,
					email: newUser.email,
					role: newUser.role,
				},
				accessToken, // Return access token in response body
			},
		});

		logger.info('User registered successfully', {
			username: newUser.username,
			email: newUser.email,
			role: newUser.role,
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while registering the user.',
			type: 'server_error',
			error: error,
		});
		logger.error('Error during user registration', error);
	}
};

export default register;
