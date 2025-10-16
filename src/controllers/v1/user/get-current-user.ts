// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import User from '@/models/user';

// Types
import type { Request, Response } from 'express';

const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
	try {
		// Get user ID from request
		const userId = req.userId;

		// Fetch user from database excluding sensitive fields
		const user = await User.findById(userId).select('-__v').lean().exec();

		response(res, STATUS.OK, {
			code: 'success',
			message: 'Current user fetched successfully.',
			type: 'success',
			data: {
				user,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while fetching the current user.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while getting current user: ${error}`);
	}
};

export default getCurrentUser;
