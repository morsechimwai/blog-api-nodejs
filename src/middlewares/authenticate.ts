import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Custom modules
import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

// Types
import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

/**
 * @function authenticate
 * @description Middleware to verify the user access token from the Authorization header.
 * If the token is valid, it attaches the user ID to the request object and calls next().
 * If the token is invalid or missing, it responds with a 401 Unauthorized status.
 * @param {Request} req  - Express Request object
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction to pass control to the next middleware
 *
 * @returns {void}
 */

const authenticate = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith('Bearer ')) {
		response(res, STATUS.UNAUTHORIZED, {
			code: 'permission_denied',
			message:
				"We couldn't find a valid access token. Please sign in and try again.",
			type: 'authorization_error',
		});
		return;
	}

	// Split out the token from the "Bearer" prefix
	const [_, token] = authHeader.split(' ');

	try {
		// Verify the token and extract the userId
		const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };
		req.userId = jwtPayload.userId;

		// Proceed to the next middleware or route handler
		return next();
	} catch (error) {
		// Handle expired token error
		if (error instanceof TokenExpiredError) {
			response(
				res,
				STATUS.UNAUTHORIZED,
				{
					code: 'permission_denied',
					message:
						'Your access token has expired. Please use your refresh token to get a new one.',
					type: 'authorization_error',
				},
			);
			return;
		}

		// Handle invalid token error
		if (error instanceof JsonWebTokenError) {
			response(res, STATUS.UNAUTHORIZED, {
				code: 'permission_denied',
				message: 'The access token provided is invalid.',
				type: 'authorization_error',
			});
			return;
		}

		// Catch-all for any other errors
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'We ran into a problem while verifying your access token.',
			type: 'server_error',
		});

		logger.error('Error during authentication:', error);
		return;
	}
};

export default authenticate;
