import express from 'express';

import dbConnection from './database/connection.js';
import config from './config/index.js';
import expressApp from './app.js';
// import errorHandler from './utils/error/index.js';
import { errorhandler } from './utils/errorhandler.js';

const startServer = async () => {
    const app = express();

    //  database connection
    await dbConnection();

    const channel = 'ini test channel';

    await expressApp(app, channel);
    // errorHandler(app);
    errorhandler(app);

    app.listen(config.app.port, () => {
        console.log(
            `[${config.app.name}] listening to port ${config.app.port}`,
        );
    })
        .on('error', (err) => {
            console.log(err);
            process.exit();
        })
        .on('close', () => {
            channel.close();
        });
};

startServer();
