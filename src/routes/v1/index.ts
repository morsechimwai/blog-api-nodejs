import { Router } from 'express';
// Custom modules
import config from '@/config';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Routes
import authRoutes from '@/routes/v1/auth';
import userRoutes from '@/routes/v1/user';
import blogRoutes from '@/routes/v1/blog';
import likeRoutes from '@/routes/v1/like';
import commentRoutes from '@/routes/v1/comment';

// Initialize router
const router = Router();

// Root route
router.get('/', (req, res) => {
	response(res, STATUS.OK, {
		code: 'success',
		message: 'API is running',
		type: 'success',
		data: {
			status: 'ok',
			version: '1.0.0',
			docs: config.DOCS_URL,
			timestamp: new Date().toISOString(),
		},
	});
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/likes', likeRoutes);
router.use('/comments', commentRoutes);

export default router;
