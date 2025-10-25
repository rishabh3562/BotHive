import type { DatabaseResult } from './types';

/** Normalizes an unknown error into an Error object */
export const normalizeError = (error: unknown): Error => {
	return error instanceof Error ? error : new Error(String(error));
};

/** Logs an error and returns a standardized DatabaseResult error object */
export const logAndReturnError = <T = unknown>(
	error: unknown,
	context?: string
): DatabaseResult<T> => {
	const message = error instanceof Error ? error.message : "Unknown error";
	console.error(context ? `[${context}]: ${message}` : message);
	return { data: null, error: normalizeError(error) } as DatabaseResult<T>;
};
