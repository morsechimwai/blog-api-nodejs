import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Custom modules
import { logger } from '@/lib/winston';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import Token from '@/models/token';

// Types
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

const refreshToken = async (req: Request, res: Response): Promise<void> => {
	const refreshToken = req.cookies.refreshToken as string;

	try {
		// Check if refresh token is provided
		const tokenExists = await Token.exists({ token: refreshToken });

		// Check if the refresh token exists in the database
		if (!tokenExists) {
			response(res, STATUS.UNAUTHORIZED, {
				code: 'permission_denied',
				message: 'This refresh token is invalid or has already been used.',
				type: 'authorization_error',
			});
			return;
		}

		// Verify the refresh token
		// ตรวจสอบความถูกต้องของ refresh token
		const jwtPayload = verifyRefreshToken(refreshToken) as {
			userId: Types.ObjectId;
		};

		// Generate a new access token
		// สร้าง access token ใหม่
		const accessToken = generateAccessToken(jwtPayload.userId);

		// Send the new access token in the response
		// ส่ง access token ใหม่ใน response
		response(res, STATUS.OK, {
			code: 'success',
			message: 'Access token refreshed successfully.',
			type: 'success',
			data: {
				accessToken,
			},
		});
	} catch (error) {
		// Handle expired token error
		if (error instanceof TokenExpiredError) {
			response(
				res,
				STATUS.UNAUTHORIZED,
				{
					code: 'permission_denied',
					message: 'Your refresh token has expired. Please log in again.',
					type: 'authorization_error',
				},
			);
			return;
		}

		// Handle invalid token error
		if (error instanceof JsonWebTokenError) {
			response(res, STATUS.UNAUTHORIZED, {
				code: 'permission_denied',
				message: 'The refresh token provided is invalid.',
				type: 'authorization_error',
			});
			return;
		}

		// Handle other errors
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while refreshing the access token.',
			type: 'server_error',
			error,
		});

		logger.error('Error during refresh token', { error });
	}
};

export default refreshToken;
