import express from 'express';
import cors from 'cors';

import Routes from './routes/index.js';

export default async (channel) => {
    const app = express();
    app.use(express.json());
    app.use(cors({ origin: ['http://localhost:8000'] }));

    app.use(Routes(channel));
    return app;

    // // API ENDPOINT NOT FOUND
    // app.use((req, res, next) => {
    //     const error = new Error("API endpoint doesn't exist! [USER SERVICE]");
    //     error.status = 404;
    //     next(error);
    // });

    // // error handler middleware
    // app.use((error, req, res, _) => {
    //     res.status(error.status || 500).json({
    //         success: false,
    //         data: [],
    //         message: error.message || 'Internal Server Error',
    //     });
    // });
};
