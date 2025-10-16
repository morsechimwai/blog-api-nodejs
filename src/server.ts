import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

// Custom modules
import config from '@/config';
import limiter from '@/lib/express-rate-limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from '@/lib/winston';

// Routes
import v1Routes from '@/routes/v1';

// Types
import { CorsOptions } from 'cors';

// CORS configuration
// กำหนดการตั้งค่า CORS เพื่อควบคุมแหล่งที่มาที่อนุญาตให้เข้าถึง API
const corsOptions: CorsOptions = {
	origin(origin, callback) {
		if (
			!origin || // Allow requests with no origin (like mobile apps or curl requests)
			config.NODE_ENV === 'development' ||
			config.WHITELISTED_ORIGINS.includes(origin)
		) {
			// อนุญาตให้เข้าถึง
			callback(null, true);
		} else {
			// ปฏิเสธการเข้าถึง
			callback(
				new Error(`CORS error: ${origin} is not allowed by CORS`),
				false,
			);
			logger.error(`CORS error: ${origin} is not allowed by CORS`);
		}
	},
};

// Initialize Express application
const app = express();

// Apply CORS middleware
// เพื่อรองรับการร้องขอจากแหล่งที่มาที่อนุญาต
app.use(cors(corsOptions));

// Enable JSON body parsing
// เพื่อรองรับการส่งข้อมูลในรูปแบบ JSON
app.use(express.json());

// Enable URL-encoded body parsing
// เพื่อรองรับการส่งข้อมูลในรูปแบบ URL-encoded
app.use(express.urlencoded({ extended: true }));

// Apply security-related HTTP headers
// เพื่อเพิ่มความปลอดภัยให้กับแอปพลิเคชัน
app.use(cookieParser());

// Enable response compression to reduce payload size and improve performance
// เปิดใช้งานการบีบอัดการตอบสนองเพื่อลดขนาดข้อมูลที่ส่งและปรับปรุงประสิทธิภาพ
app.use(
	compression({
		threshold: 1024, // Only compress responses larger than 1KB
	}),
);

// Use Helmet to set various HTTP headers for security
// เพื่อป้องกันการโจมตีทั่วไป
app.use(helmet());

// Apply rate limiting middleware to prevent excessive requests
// เพื่อป้องกันการโจมตีแบบ brute-force และ DDoS
app.use(limiter);

// IIFE for potential future asynchronous initialization
// ใช้ IIFE เพื่อรองรับการเริ่มต้นที่อาจต้องใช้ async ในอนาคต
(async () => {
	try {
		// Connect to MongoDB database
		await connectToDatabase();
		// Register API routes
		app.use('/api/v1', v1Routes);

		// Start the server and listen on the specified port
		app.listen(config.PORT, () => {
			logger.info(`Server is running on http://localhost:${config.PORT}`);
		});
	} catch (error) {
		logger.error('Fail to start the server:', error);

		// Exit the process with failure code in production environment
		if (config.NODE_ENV === 'production') {
			process.exit(1); // เพื่อให้ระบบจัดการกระบวนการ (Process Manager) รีสตาร์ทแอป
		}
	}
})();

// Graceful shutdown handler
// ฟังก์ชันสำหรับจัดการการปิดเซิร์ฟเวอร์อย่างถูกต้อง
const handleServerShutdown = async () => {
	try {
		// Disconnect from MongoDB database
		await disconnectFromDatabase();

		// Log shutdown message and exit process
		logger.warn('Server SHUTDOWN');
		process.exit(0);
	} catch (error) {
		logger.error('Error during server shutdown:', error);
	}
};

// Listen for termination signals to gracefully shut down the server
// เพื่อให้แน่ใจว่าเซิร์ฟเวอร์จะปิดตัวลงอย่างถูกต้องเมื่อได้รับสัญญาณการหยุดทำงาน
process.on('SIGINT', handleServerShutdown);
process.on('SIGTERM', handleServerShutdown);
