import express from 'express';
import dbConnection from './database/connection.js';
import config from './config/index.js';
import expressApp from './app.js';
// import errorHandler from './utils/error/index.js';
import { errorhandler } from './utils/errorhandler.js';

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
        errorhandler(app);

        app.use((req, res, next) => {
            const error = new Error("API endpoint doesn't exist!");
            error.status = 404;
            next(error);
        });

        // error handler middleware
        app.use((error, req, res, _) => {
            console.log('API ERROR', error);
            res.status(error.status || 500).json({
                success: false,
                data: [],
                message: error.message || 'Internal Server Error',
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
