import Sentry from '@sentry/node';
import _ from '@sentry/tracing';

import { ValidationError, NotFoundError, AuthorizeError } from './appErrors.js';
import config from '../../config/index.js';

Sentry.init({
    dsn: config.DSN_SENTRY,
    tracesSampleRate: 1.0,
});

export default (app) => {
    app.use((error, req, res, next) => {
        console.log('MASUK');
        let reportError = true;

        // skip common / known errors
        [NotFoundError, ValidationError, AuthorizeError].forEach(
            (typeOfError) => {
                if (error instanceof typeOfError) {
                    reportError = false;
                }
            },
        );

        if (reportError) {
            Sentry.captureException(error);
        }
        const statusCode = error.statusCode || 500;
        const data = error.data || error.message;
        return res.status(statusCode).json(data);
    });
};
