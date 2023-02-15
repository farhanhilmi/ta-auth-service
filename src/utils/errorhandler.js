import { createLogger, transports } from 'winston';
import { BaseError } from './appErrors.js';

const logErrors = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app_error.log' }),
    ],
});

class ErrorLogger {
    constructor() {}
    async logError(err) {
        console.log('==================== Start Error Logger ===============');
        logErrors.log({
            private: true,
            level: 'error',
            message: `${new Date()}-${JSON.stringify(err)}`,
        });
        console.log('==================== End Error Logger ===============');
        // log error with Logger plugins

        return false;
    }

    isTrustError(error) {
        if (error instanceof BaseError) {
            return error.isOperational;
        } else {
            return false;
        }
    }
}

export const errorhandler = (app) => {
    app.use(async (err, req, res, next) => {
        const errorLogger = new ErrorLogger();

        process.on('uncaughtException', (reason, promise) => {
            console.log('UNHANDLED', reason);
            throw reason; // need to take care
        });

        process.on('uncaughtException', (error) => {
            errorLogger.logError(error);
            if (errorLogger.isTrustError(err)) {
                //process exist // need restart
            }
        });

        // console.log(err.description, '-------> DESCRIPTION')
        // console.log(err.message, '-------> MESSAGE')
        // console.log(err.name, '-------> NAME')

        if (err) {
            await errorLogger.logError(err);
            if (errorLogger.isTrustError(err)) {
                if (err.errorStack) {
                    const errorDescription = err.errorStack;
                    return res.status(err.statusCode).json({
                        message: errorDescription,
                        status: 'failed',
                        data: [],
                    });
                }
                return res
                    .status(err.statusCode)
                    .json({ message: err.message, status: 'failed', data: [] });
            } else {
                //process exit // terriablly wrong with flow need restart
                console.log('HARUS EXIT DONG');
            }
            console.log(err);
            return res
                .status(err.statusCode || 500)
                .json({ status: 'failed', message: err.message, data: [] });
        }
        next();
    });
};
