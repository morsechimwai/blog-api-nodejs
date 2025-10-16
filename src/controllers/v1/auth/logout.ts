// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import Token from '@/models/token';

// Types
import type { Request, Response } from 'express';

const logout = async (req: Request, res: Response): Promise<void> => {
	try {
		const refreshToken = req.cookies.refreshToken as string;

		if (refreshToken) {
			// Delete the refresh token from the database
			await Token.deleteOne({ token: refreshToken });
			logger.info('User refresh token deleted successfully', {
				userId: req.userId,
				token: refreshToken,
			});
		}

		// Clear the refresh token cookie
		res.clearCookie('refreshToken', {
			httpOnly: true, // Ensure the cookie is HTTP-only
			secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
			sameSite: 'strict', // Adjust based on your requirements
		});

		// Successful logout, no content to return
		response(res, STATUS.NO_CONTENT, {
			code: 'success',
			message: 'User logged out successfully.',
			type: 'success',
		});

		logger.info('User logged out successfully', { userId: req.userId });
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while logging out.',
			type: 'server_error',
			error,
		});

		logger.error('Error during logout:', error);
	}
};

export default logout;
