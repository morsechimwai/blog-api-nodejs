import winston from 'winston';

// Custom modules
import config from '@/config';

// Define custom log format
// รูปแบบการบันทึก log ที่กำหนดเอง
const { combine, timestamp, json, errors, align, printf, colorize } =
	winston.format;

// Define the transport array to hold different logging transports
// Transport คือที่ที่ log จะถูกส่งไป เช่น console, file, remote server เป็นต้น
const transports: winston.transport[] = [];

if (config.NODE_ENV !== 'production') {
	transports.push(
		new winston.transports.Console({
			format: combine(
				colorize({ all: true }), // เพิ่มสีสันให้กับ log ใน console
				align(), // จัดแนวข้อความ log ให้เรียบร้อย
				printf(({ timestamp, level, message, ...meta }) => {
					const metaString = Object.keys(meta).length
						? `\n${JSON.stringify(meta)}`
						: '';
					return `${timestamp} [${level}]: ${message}${metaString}`;
				}),
			),
		}),
	);
}

// Create a Winston logger instance with the defined configuration
// สร้างอินสแตนซ์ของ logger ด้วยการตั้งค่าที่กำหนด
const logger = winston.createLogger({
	level: config.LOG_LEVEL || 'info', // ระดับของ log ที่จะบันทึก
	format: combine(
		timestamp(), // เพิ่ม timestamp ให้กับ log
		errors({ stack: true }), // บันทึก stack trace สำหรับ error
		json(), // บันทึก log ในรูปแบบ JSON
	),
	transports, // กำหนด transport ที่จะใช้
	silent: config.NODE_ENV === 'test', // ปิดการบันทึก log ในสภาพแวดล้อมการทดสอบ
});

export { logger };
