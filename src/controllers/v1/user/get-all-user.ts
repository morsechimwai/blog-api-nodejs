// Custom modules
import { logger } from '@/lib/winston';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';
import config from '@/config';

// Models
import User from '@/models/user';

// Types
import type { Request, Response } from 'express';

const getAllUser = async (req: Request, res: Response): Promise<void> => {
	try {
		// Pagination
		// Limit is the number of items per page
		const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
		// Offset is the starting index
		const offset =
			parseInt(req.query.offset as string) || config.defaultResOffset;
		const total = await User.countDocuments();

		const users = await User.find()
			.select('-__v')
			.limit(limit)
			.skip(offset)
			.lean()
			.exec();

		response(res, STATUS.OK, {
			code: 'success',
			message: 'Users fetched successfully.',
			type: 'success',
			data: {
				limit,
				offset,
				total,
				users,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while fetching users.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error fetching all users: ${error}`);
	}
};

export default getAllUser;
