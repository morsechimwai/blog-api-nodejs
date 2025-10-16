// Custom modules
import { logger } from '@/lib/winston';

// Models
import User from '@/models/user';
import { STATUS } from '@/utils/http-status';
import { response } from '@/utils/response';

// Types
import type { Request, Response } from 'express';

const updateCurrentUser = async (
	req: Request,
	res: Response,
): Promise<void> => {
	// Get user ID from request
	const userId = req.userId;
	const {
		username,
		email,
		password,
		firstName,
		lastName,
		website,
		facebook,
		instagram,
		x,
		youtube,
	} = req.body;

	try {
		// Update user in database
		const user = await User.findById(userId).select('+password -__v').exec();

		if (!user) {
			response(res, STATUS.NOT_FOUND, {
				code: 'not_found',
				message: 'We could not find the current user.',
				type: 'resource_error',
			});
			return;
		}

		// Update user fields if provided
		if (username) user.username = username;
		if (email) user.email = email;
		if (password) user.password = password;
		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		if (!user.socialLinks) {
			user.socialLinks = {};
		}
		if (website) user.socialLinks.website = website;
		if (facebook) user.socialLinks.facebook = facebook;
		if (instagram) user.socialLinks.instagram = instagram;
		if (x) user.socialLinks.x = x;
		if (youtube) user.socialLinks.youtube = youtube;

		// Save the updated user
		await user.save();

		logger.info(`User update successfully`, { user });

		response(res, STATUS.OK, {
			code: 'success',
			message: 'User updated successfully.',
			type: 'success',
			data: {
				user,
			},
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while updating the user.',
			type: 'server_error',
			error: error,
		});

		logger.error(`Error while updating current user: ${error}`);
	}
};

export default updateCurrentUser;
