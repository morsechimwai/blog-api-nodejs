// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

// Models
import User from '@/models/user';
import Token from '@/models/token';

// Types
import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

// Pick only the necessary fields from IUser for login
type UserData = Pick<IUser, 'email' | 'password'>;

// Login controller
const login = async (req: Request, res: Response): Promise<void> => {
	try {
		// Validate request body
		const { email } = req.body as UserData;

		// Check if email and password are provided
		const user = await User.findOne({ email })
			.select('username email password role')
			.lean()
			.exec();

		if (!user) {
			response(res, STATUS.UNAUTHORIZED, {
				code: 'permission_denied',
				message: 'We could not find an account with that email address.',
				type: 'authorization_error',
			});
			return;
		}

		// Genarate access token and refresh token for the user
		const accessToken = generateAccessToken(user._id);
		const refreshToken = generateRefreshToken(user._id);

		// Store refresh token in db
		await Token.create({ token: refreshToken, userId: user._id });

		// Log the creation of the refresh token
		logger.info('Refresh token created for user', {
			userId: user._id,
			token: refreshToken,
		});

		// Set refresh token in HTTP-only cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
			sameSite: 'strict', // Adjust based on your requirements
		});

		response(res, STATUS.CREATED, {
			code: 'created',
			message: 'User logged in successfully.',
			type: 'success',
			data: {
				user: {
					username: user.username,
					email: user.email,
					role: user.role,
				},
				accessToken,
			},
		});

		logger.info(`User regirstered successfully`, { user });
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while logging in.',
			type: 'server_error',
			error,
		});

		logger.error('Error during user login:', error);
	}
};

export default login;
