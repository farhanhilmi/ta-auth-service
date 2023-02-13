import { Router } from 'express';

import Users from '../api/users.js';

const Routes = (channel) => {
    const router = Router();
    const controller = new Users(channel);

    router.get('/', controller.testApi.bind(controller));
    return router;
};

export default Routes;
