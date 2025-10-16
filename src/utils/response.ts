import { Response } from 'express';
import { STATUS, StatusValue } from './http-status';

// ใช้ generic เพื่อกำหนด type ของ data และ error ได้
export interface ApiResponse<TData = unknown, TError = unknown> {
	success: boolean;
	code: string;
	message?: string;
	data?: TData;
	error?: TError;
	detail?: string;
}

export function response<TData = unknown, TError = unknown>(
	res: Response,
	statusObj: StatusValue,
	dataOrMessage?: TData | string,
	detailOrError?: string | TError,
) {
	const { code, status } = statusObj;

	// No Content
	if (status === 204) return res.sendStatus(204);

	// Success
	if (status < 400) {
		const baseBody: ApiResponse<TData> = {
			success: true,
			code,
		};

		let body: ApiResponse<TData> = baseBody;

		if (typeof dataOrMessage === 'string') {
			body = {
				...baseBody,
				message: dataOrMessage,
			};
		} else if (dataOrMessage && typeof dataOrMessage === 'object') {
			const payload = dataOrMessage as Record<string, unknown>;
			body = {
				...baseBody,
				...payload,
			} as ApiResponse<TData>;

			if (typeof payload.code === 'string') {
				body.code = payload.code;
			}

			if (typeof payload.message === 'string') {
				body.message = payload.message;
			}
		}

		if (detailOrError && typeof detailOrError === 'object') {
			body.error = (body.error ?? detailOrError) as TError;
		} else if (typeof detailOrError === 'string') {
			body.detail = body.detail ?? detailOrError;
		}

		return res.status(status).json(body);
	}

	// Error
	const baseBody: ApiResponse<null, TError> = {
		success: false,
		code,
	};

	if (typeof dataOrMessage === 'string') {
		baseBody.message = dataOrMessage;
	}

	let body: ApiResponse<null, TError> = baseBody;

	if (dataOrMessage && typeof dataOrMessage === 'object') {
		const payload = dataOrMessage as Record<string, unknown>;
		body = {
			...baseBody,
			...payload,
		} as ApiResponse<null, TError>;

		if (typeof payload.code === 'string') {
			body.code = payload.code;
		}

		if (typeof payload.message === 'string') {
			body.message = payload.message;
		}
	}

	if (detailOrError && typeof detailOrError === 'object') {
		body.error = (body.error ?? detailOrError) as TError;
	} else if (typeof detailOrError === 'string') {
		body.detail = body.detail ?? detailOrError;
	}

	if (!body.message) {
		body.message = code;
	}

	return res.status(status).json(body);
}
