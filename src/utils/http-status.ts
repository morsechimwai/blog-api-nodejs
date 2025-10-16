export const STATUS = {
	OK: { code: 'OK', status: 200 },
	CREATED: { code: 'CREATED', status: 201 },
	NO_CONTENT: { code: 'NO_CONTENT', status: 204 },
	BAD_REQUEST: { code: 'BAD_REQUEST', status: 400 },
	UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
	FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
	NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
	PAYLOAD_TOO_LARGE: { code: 'PAYLOAD_TOO_LARGE', status: 413 },
	INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', status: 500 },
} as const;

export type StatusKey = keyof typeof STATUS;
export type StatusValue = (typeof STATUS)[StatusKey];
