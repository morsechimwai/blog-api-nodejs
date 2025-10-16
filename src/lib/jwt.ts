import jwt from 'jsonwebtoken';

// Custom modules
import config from '@/config';

// Types
import { Types } from 'mongoose';

// Generate JWT tokens
// ฟังก์ชันสำหรับสร้าง JWT access token
export const generateAccessToken = (userId: Types.ObjectId): string => {
	return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
		// ใช้ความลับในการเข้ารหัส token
		expiresIn: config.ACCESS_TOKEN_EXPIRY, // กำหนดอายุของ token
		subject: 'accessApi', // กำหนดหัวเรื่องของ token
	});
};

// ฟังก์ชันสำหรับสร้าง JWT refresh token
export const generateRefreshToken = (userId: Types.ObjectId): string => {
	return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
		// ใช้ความลับในการเข้ารหัส token
		expiresIn: config.REFRESH_TOKEN_EXPIRY, // กำหนดอายุของ token
		subject: 'refreshToken', // กำหนดหัวเรื่องของ token
	});
};

// Verify JWT tokens
// ฟังก์ชันสำหรับตรวจสอบความถูกต้องของ JWT token
export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, config.JWT_ACCESS_SECRET);
};

// ฟังก์ชันสำหรับตรวจสอบความถูกต้องของ JWT refresh token
export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
