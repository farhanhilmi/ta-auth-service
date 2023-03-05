import { Router } from 'express';

import TestApi from '../api/test-api.js';
import { UsersController } from '../api/users.js';

const Routes = (channel) => {
    const router = Router();
    const controller = new TestApi(channel);
    const userController = new UsersController(channel);

    router.get('/user', userController.getUser.bind(userController));
    router.post('/register', userController.register.bind(userController));
    router.post('/login', userController.login.bind(userController));
    router.post(
        '/token/refresh',
        userController.refreshToken.bind(userController),
    );

    router.post(
        '/otp/email/verify',
        userController.verifyOTP.bind(userController),
    );

    router.post(
        '/otp/sms/send',
        userController.sendSmsOTP.bind(userController),
    );

    // TESTING ROUTE
    router.get('/test', controller.testApi.bind(controller));
    router.post('/add', controller.testApiPost.bind(controller));

    return router;
};

export default Routes;
