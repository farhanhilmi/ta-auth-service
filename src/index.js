import express from 'express';
import dbConnection from './database/connection.js';
import config from './config/index.js';
import expressApp from './app.js';
// import errorHandler from './utils/error/index.js';
// import { errorhandler } from './utils/errorhandler.js';

const startServer = async () => {
    try {
        // Moment().tz('Asia/Calcutta').format();
        // moment.tz.setDefault('Asia/Calcutta');

        //  database connection
        // await dbConnection();

        // const channel = 'ini test channel';
        // const channel = await CreateChannel();

        const app = await expressApp();
        // errorHandler(app);
        // errorhandler(app);

        // API ENDPOINT NOT FOUND
        app.use((req, res, next) => {
            const error = new Error("API endpoint doesn't exist!");
            error.statusCode = 404;
            error.status = 'Not Found';
            next(error);
        });

        // error handler middleware
        app.use((error, req, res, _) => {
            console.log('error', error);
            const message = !error.statusCode
                ? 'Internal Server Error'
                : error.message;
            res.status(error.statusCode || 500).json({
                status: !error.statusCode ? 'Internal Server Error' : false,
                data: [],
                message,
            });
        });

        app.listen(config.app.port, () => {
            console.log(
                `[${config.app.name}] listening to port ${config.app.port}`,
            );
            // console.log('process.env', process.env);
        })
            .on('error', (err) => {
                console.log(err);
                process.exit();
            })
            .on('close', () => {
                channel.close();
            });
    } catch (error) {
        console.log('ERROR', error);
    }
};

startServer();
