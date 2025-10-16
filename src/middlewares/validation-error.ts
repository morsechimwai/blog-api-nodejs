import { validationResult } from 'express-validator';

// Types
import { Request, Response, NextFunction } from 'express';
import { response } from '@/utils/response';
import { STATUS } from '@/utils/http-status';

// Middleware to handle validation errors
// ตัวกลางสำหรับจัดการข้อผิดพลาดในการตรวจสอบข้อมูล
const validationError = (req: Request, res: Response, next: NextFunction) => {
	// Check for validation errors
	// ตรวจสอบข้อผิดพลาดในการตรวจสอบข้อมูล
	const errors = validationResult(req);

	// If there are errors, respond with 400 and the error details
	// หากมีข้อผิดพลาด ให้ตอบกลับด้วยสถานะ 400 และรายละเอียดข้อผิดพลาด
	if (!errors.isEmpty()) {
		response(res, STATUS.BAD_REQUEST, {
			code: 'validation_failed',
			message: 'Please check the provided information and try again.',
			type: 'validation_error',
			error: errors.mapped(),
		});
		return;
	}

	next();
};

export default validationError;
