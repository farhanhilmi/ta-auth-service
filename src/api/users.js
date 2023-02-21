import AuthService from '../services/auth.js';

// import userServices from '../services/index.js';
export class UsersController {
    constructor(channel) {
        this.channel = channel;
        this.authService = new AuthService();
        // this.TestService = new userServices();
    }

    async getUser(req, res, next) {
        try {
            const { userId, roles } = JSON.parse(req.header('user'));

            const data = await this.authService.getUserData({ userId, roles });

            res.status(200).json({
                status: 'OK',
                message: 'success fetching data',
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const data = await this.authService.createAccount(req.body);
            // const data = await this.authService.createAccount(req.body);
            res.status(201).json({
                status: 'OK',
                message: 'success create new account',
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const data = await this.authService.login(req.body);
            res.status(200).json({
                status: 'OK',
                message: 'success logged in',
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const data = await this.authService.refreshToken({
                token: req.body.refreshToken,
            });
            res.status(200).json({
                status: 'OK',
                message: 'success generate new access token',
                data,
            });
        } catch (error) {
            next(error);
        }
    }
}
