export const STATUS_CODES = {
    OK: 200,
    BAD_REQUEST: 400,
    UN_AUTHORISED: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
    CONFLICT_ERROR: 409,
};

export class BaseError extends Error {
    constructor(
        name,
        statusCode,
        description,
        isOperational,
        errorStack,
        logingErrorResponse,
    ) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorStack = errorStack;
        this.logError = logingErrorResponse;
        Error.captureStackTrace(this);
    }
}

// 500 Internal Error
export class APIError extends BaseError {
    constructor(description = 'api error') {
        super(
            'api internal server error',
            STATUS_CODES.INTERNAL_ERROR,
            description,
        );
    }
}

// 400 Validation Error
export class ValidationError extends BaseError {
    constructor(description = 'bad request') {
        super('bad request', STATUS_CODES.BAD_REQUEST, description);
    }
}

// 403 Authorize error
export class AuthorizeError extends BaseError {
    constructor(description = 'access denied') {
        super('access denied', STATUS_CODES.UN_AUTHORISED, description);
    }
}

// 404 Not Found
export class NotFoundError extends BaseError {
    constructor(description = 'not found') {
        super('not found', STATUS_CODES.NOT_FOUND, description);
    }
}

export class DataConflictError extends BaseError {
    constructor(description = 'not found') {
        super('data already exist', STATUS_CODES.CONFLICT_ERROR, description);
    }
}
