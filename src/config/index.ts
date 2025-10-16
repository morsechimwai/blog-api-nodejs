import dotdenv from 'dotenv';

// Types
import type ms from 'ms';

dotdenv.config();

const config = {
	DOCS_URL: process.env.DOCS_URL,
	PORT: process.env.PORT || 3000,
	NODE_ENV: process.env.NODE_ENV || 'development',
	WHITELISTED_ORIGINS: ['https://docs.blog-api.morsechimwai.com'],
	MONGO_URI: process.env.MONGO_URI,
	LOG_LEVEL: process.env.LOG_LEVEL || 'info',
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
	ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
	REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
	WHITELIST_ADMINS_MAIL: [
		'morse.chimwai@gmail.com',
		'morse.chimwai@icloud.com',
	],
	defaultResLimit: 20, // Default number of items per page
	defaultResOffset: 0, // Default starting index
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
};

export default config;
