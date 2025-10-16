// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Models
import User from '@/models/user';

// Types
import type { Request, Response } from 'express';

const getUser = async (req: Request, res: Response): Promise<void> => {
	try {
		// Get user ID from request parameters
		const userId = req.params.userId;

		const user = await User.findById(userId).select('-__v').exec();

		if (!user) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find that user.',
				type: 'resource_error',
			});
			return;
		}

		response(res, STATUS.OK, {
			code: 'success',
			message: 'User fetched successfully.',
			type: 'success',
			data: { user },
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while fetching the user.',
			type: 'server_error',
			error: error,
		});
		logger.error(`Error while getting a user: ${error}`);
	}
};

export default getUser;
