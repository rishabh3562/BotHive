import type { DatabaseResult } from './types';

/** Normalizes an unknown error into an Error object */
export const normalizeError = (error: unknown): Error => {
	if (error instanceof Error) return error;
	try {
		// If it's an object, try to stringify for more context
		if (typeof error === "object" && error !== null) {
			return new Error(JSON.stringify(error));
		}
		return new Error(String(error));
	} catch (e) {
		return new Error("Unknown error");
	}
};

/** Logs an error and returns a standardized DatabaseResult error object */
export const logAndReturnError = <T = unknown>(
	error: unknown,
	context?: string
): DatabaseResult<T> => {
	let message: string;
	if (error instanceof Error) message = error.message;
	else if (typeof error === "object" && error !== null) {
		try {
			message = JSON.stringify(error);
		} catch {
			message = "[object]";
		}
	} else {
		message = String(error);
	}

	// Log both a readable message and the original error object to aid debugging.
	// Passing the error as a second argument ensures rich inspection in test output.
	// eslint-disable-next-line no-console
	console.error(context ? `[${context}]: ${message}` : message, error);

	return { data: null, error: normalizeError(error) } as DatabaseResult<T>;
};
