// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import User from '@/models/user';

// Types
import type { Request, Response, NextFunction } from 'express';

export type AuthRole = 'admin' | 'user';

const authorize = (roles: AuthRole[]) => {
	// Return a middleware function
	return async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.userId;
		try {
			// Fetch user from database
			const user = await User.findById(userId).select('role').exec();

			// If user not found
			// ตรวจสอบว่ามี user อยู่ในระบบหรือไม่
			if (!user) {
				response(res, STATUS.NOT_FOUND, {
					code: 'not_found',
					message: 'We could not find that user.',
					type: 'resource_error',
				});
				return;
			}

			// Check if user role is in the allowed roles
			// ดูว่า role ของ user อยู่ใน roles ที่อนุญาตหรือไม่
			if (!roles.includes(user.role)) {
				response(res, STATUS.FORBIDDEN, {
					code: 'permission_denied',
					message:
						"You don't have permission to perform this action right now.",
					type: 'authorization_error',
				});
				return;
			}

			return next();
		} catch (error) {
			response(res, STATUS.INTERNAL_SERVER_ERROR, {
				code: 'internal_error',
				message: 'We ran into an issue while authorizing this request.',
				type: 'server_error',
				error: error,
			});

			logger.error(`Error while authorizing user: ${error}`);
		}
	};
};

export default authorize;
