import { v2 as cloudinary } from 'cloudinary';

// Custom modules
import { logger } from '@/lib/winston';

// Models
import User from '@/models/user';
import Blog from '@/models/blog';

// Types
import type { Request, Response } from 'express';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

const deleteUser = async (req: Request, res: Response): Promise<void> => {
	const userId = req.params.userId;

	try {
		// Find all blogs by the user to delete associated banner images
		const blogs = await Blog.find({ author: userId })
			.select('banner.publicId')
			.lean()
			.exec();

		// If user has blogs, delete their banner images and the blogs themselves
		if (blogs.length) {
			// Delete all banner images from Cloudinary
			const publicIds = blogs.map(({ banner }) => banner.publicId);
			await cloudinary.api.delete_resources(publicIds);

			logger.info(`Mutiple blog banner images deleted from Cloudinary`, {
				publicIds,
			});

			// Delete all blogs by the user from database
			await Blog.deleteMany({ author: userId });
			logger.info(`Multiple blogs deleted.`, { userId, blogs });
		}

		// Delete user from database
		await User.deleteOne({ _id: userId });
		logger.info(`A user account has been deleted.`, { userId });

		response(res, STATUS.NO_CONTENT, {
			code: 'success',
			message: 'User account deleted successfully.',
			type: 'success',
		});
	} catch (error) {
		response(res, STATUS.INTERNAL_SERVER_ERROR, {
			code: 'internal_error',
			message: 'Something went wrong while deleting the user.',
			type: 'server_error',
			error: error,
		});
		logger.error(`Error while deleting a user: ${error}`);
	}
};

export default deleteUser;
