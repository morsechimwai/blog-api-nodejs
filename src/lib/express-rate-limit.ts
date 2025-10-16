import { rateLimit } from 'express-rate-limit';

// Configure rate limiting middleware to prevent abuse
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	limit: 60, // limit each IP to 60 requests per windowMs
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: {
		error:
			'You have sent too many in a given amount of time! Please try again later.',
	},
});

export default limiter;
