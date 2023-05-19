import config from '../config/index.js';
import AuthService from '../services/auth.js';
import changePassword from '../services/forget-password/changePassword.js';
import requestResetPassword from '../services/forget-password/requestResetPassword.js';
import {
    resendOTPLogin,
    resendVerifyAccount,
} from '../services/mail/sendEmail.js';
import sendSms from '../services/sendSmsOtp.js';
import { PublishMessage } from '../utils/messageBroker.js';

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
                status: true,
                message: 'success fetching data',
                data,
                meta: {},
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
                status: true,
                message:
                    'We have sent you an email verification link. Please check your email to verify your account.',
                data,
                meta: {},
            });
        } catch (error) {
            next(error);
        }
    }

    async resendVerifyAccount(req, res, next) {
        try {
            const { userId } = req.params;
            const data = await resendVerifyAccount(userId);
            // const data = await this.authService.createAccount(req.body);
            res.status(200).json({
                status: true,
                message:
                    'We have sent you an email verification link. Please check your email to verify your account.',
                data,
                meta: {},
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmailAccount(req, res, next) {
        try {
            const { userId, token } = req.params;
            const { data, roles } = await this.authService.verifyEmailAccount(
                userId,
                token,
            );
            console.log('roles', roles);
            if (roles.toLowerCase() === 'borrower') {
                PublishMessage(
                    {
                        userId,
                    },
                    'VERIFY_NEW_ACCOUNT',
                    'Borrower',
                );
            }
            if (roles.toLowerCase() === 'lender') {
                PublishMessage(
                    {
                        userId,
                    },
                    'VERIFY_NEW_ACCOUNT',
                    'Lender',
                );
            }
            // PublishMessage(
            //     {
            //         userId: req.body.userId,
            //     },
            //     'VERIFY_NEW_ACCOUNT',
            //     'Borrower',
            // );

            // const data = await this.authService.createAccount(req.body);
            res.status(200).json({
                status: true,
                message: 'Success verified email',
                data,
                meta: {},
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        const { action } = req.query;
        try {
            const data = await this.authService.login(req.body, action);
            res.status(200).json({
                status: true,
                message: data.message,
                data: data.data,
                meta: {},
            });
        } catch (error) {
            next(error);
        }
    }

    async resendOTPLogin(req, res, next) {
        const { email } = req.body;
        try {
            const data = await resendOTPLogin(email);
            res.status(200).json({
                status: true,
                message: 'OTP has been sent to your email',
                data,
                meta: {},
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
                status: true,
                message: 'success generate new access token',
                data,
                meta: {},
            });
        } catch (error) {
            next(error);
        }
    }

    // // verify email after register
    // async verifyOTP(req, res, next) {
    //     try {
    //         const data = await this.authService.verifyOTPEmail(req.body);

    //         const dataMessage = {
    //             data: {
    //                 userId: req.body.userId,
    //             },
    //             event: 'VERIFY_NEW_ACCOUNT',
    //         };
    //         // publish message to queue
    //         // service borrower akan subscribe ke queue ini
    //         // dan akan membuat data borrower dan pekerjaan
    //         PublishMessage(
    //             {
    //                 userId: req.body.userId,
    //             },
    //             'VERIFY_NEW_ACCOUNT',
    //             'Borrower',
    //         );

    //         res.status(200).json({
    //             status: true,
    //             message: 'success verified user email!',
    //             data,
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    async requestForgetPassword(req, res, next) {
        try {
            await this.authService.forgetPassword({
                email: req.body.email,
                platform: req.body.platform,
            });
            res.status(200).json({
                status: true,
                message: 'Please check your email inbox',
                data: [],
                meta: {},
            });
        } catch (error) {
            next(error);
        }
    }

    async forgetNewPassword(req, res, next) {
        try {
            const data = await changePassword(req.body);
            res.status(200).json({
                status: true,
                message: 'success change password',
                data,
                meta: {},
            });
        } catch (error) {
            next(error);
        }
    }

    // async sendSmsOTP(req, res, next) {
    //     try {
    //         const data = await sendSms(req.body.phoneNumber);
    //         res.status(200).json({
    //             status: true,
    //             message: 'success sending sms verification code!',
    //             data,
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}
