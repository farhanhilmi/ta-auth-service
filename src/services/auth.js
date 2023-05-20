import crypto from 'crypto';
import bcrypt from 'bcrypt';
import UsersRepository from '../database/repository/users.js';
import {
    formatData,
    hashPassword,
    validateData,
    verifyPassword,
} from '../utils/index.js';
import {
    AuthorizeError,
    CredentialsError,
    DataConflictError,
    NotFoundError,
    RequestError,
    ValidationError,
} from '../utils/appErrors.js';
import {
    generateTokens,
    regenerateAccessToken,
    verifyRefreshToken,
} from '../utils/jwtToken.js';
import RefreshTokenRepository from '../database/repository/refreshTokenRepo.js';
import { sendMailRequestNewPassword } from '../utils/mail/index.js';
import OTPRepository from '../database/repository/OTPrepo.js';
import verifyLoginOTP from './verifyLoginOTP.js';
import config from '../config/index.js';
import { generateDynamicLink } from '../utils/firebase.js';
import forgetToken from '../database/models/forgetToken.js';
import verifyToken from '../database/models/verifyToken.js';
import { sendOTPLogin, sendVerifyAccount } from './mail/sendEmail.js';

class AuthService {
    constructor() {
        this.usersRepo = new UsersRepository();
        this.refreshTokenRepo = new RefreshTokenRepository();
        this.otpRepo = new OTPRepository();
    }

    async getUserData(data) {
        const { userId, roles } = data;
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            // Yes, it's a valid ObjectId,
            throw new ValidationError(
                'userId is not valid!. Please check again',
            );
        }
        if (!userId || !roles) {
            throw new ValidationError('userId & roles is required!');
        }
        const user = await this.usersRepo.findById(userId);
        if (!user) {
            throw new NotFoundError('Data not found!');
        }
        // if (user?.roles != roles || user?.roles != 'admin') {
        //     throw new AuthorizeError('You do not have access to this resource');
        // }

        return formatData(user);
    }

    async createAccount(payload) {
        const { name, email, password, roles, phoneNumber } = payload;
        const requiredField = { name, email, password, roles, phoneNumber };

        const { error, errorFields } = validateData({
            requiredField,
            data: payload,
        });
        if (error) {
            throw new ValidationError(`${errorFields} is required!`);
        }

        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/gm;

        const found = password.match(regex);

        if (!found) {
            throw new ValidationError(
                'Password must be 8 characters long, contain at least one uppercase letter, one lowercase letter, and one special character',
            );
        }

        const [isUserExist, hashedPassword] = await Promise.allSettled([
            this.usersRepo.isUserExist(email),
            hashPassword(password),
        ]);

        if (isUserExist.value) {
            throw new DataConflictError(
                'This e-mail address has already been registered',
            );
        }
        // console.log('phoneNumber', phoneNumber);
        const salt = hashedPassword.value.split('.')[0];
        // console.log('connection', Object.getOwnPropertyNames(connection));

        const user = await this.usersRepo.createUser({
            name,
            email,
            roles,
            password: hashedPassword.value,
            verified: false,
            phoneNumber,
            salt,
        });
        console.log('user', user);
        // let otpExpiredTime;

        if (user) {
            await sendVerifyAccount(user);
        }
        delete Object.assign(user, { ['userId']: user['_id'] })['_id'];
        return formatData({ ...user });
    }

    async verifyEmailAccount(userId, token) {
        if (!userId || !token) {
            throw new RequestError('userId & token is required!');
        }
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            // Yes, it's a valid ObjectId,
            throw new ValidationError(
                'userId is not valid!. Please check again',
            );
        }
        const user = await this.usersRepo.findById(userId);
        if (!user) {
            throw new CredentialsError(
                'Invalid or verification link is expired.',
            );
        }

        if (user.verified) {
            throw new DataConflictError('Your account already verified');
        }

        // const user = await this.usersRepo.findOne(userId);
        // if (!user) throw new NotFoundError('User is not found!');

        const verify = await verifyToken.findOne({
            userId,
        });

        if (!verify) {
            throw new CredentialsError(
                'Invalid or verification link is expired.',
            );
        }
        // const isValid = token === verify.token;
        const isValid = await bcrypt.compare(token, verify.token);

        if (!isValid) {
            throw new CredentialsError(
                'Invalid or verification link is expired.',
            );
        }

        const updatedUser = await this.usersRepo.updateVerifiedUser(
            userId,
            true,
        );
        if (!updatedUser) throw new NotFoundError('User not found');

        await verifyToken.deleteMany({ userId });

        return {
            data: { email: updatedUser.email, userId: updatedUser._id },
            roles: updatedUser.roles,
        };
    }

    async login(payload, action = false) {
        if (action !== 'login') {
            if (
                !Object.hasOwn(payload, 'email') ||
                !Object.hasOwn(payload, 'password')
            ) {
                throw new ValidationError(
                    'Body must be contain email and password',
                );
            }
        } else {
            if (
                !Object.hasOwn(payload, 'email') ||
                !Object.hasOwn(payload, 'otp')
            ) {
                throw new ValidationError('Body must be contain email and otp');
            }
        }

        const { email, password, otp } = payload;

        const requiredField = { email, password };
        const user = await this.usersRepo.findOne({ email }, { __v: 0 });

        if (!user)
            throw new NotFoundError(
                'Your account is not registered. Please register your account first.',
            );

        // check if user has been verified and send verification email link
        if (!user.verified) {
            await sendVerifyAccount(user);
            throw new AuthorizeError(
                'Your email is not verified!. We have sent you an email verification link. Please check your email to verify your account.',
            );
        }

        // execute this after user receive email OTP CODE
        if (action?.toLowerCase() === 'login') {
            await verifyLoginOTP(otp, user._id);
            const { accessToken, refreshToken } = await generateTokens(user);
            await this.refreshTokenRepo.create(user._id, refreshToken);
            return formatData({
                data: { accessToken, refreshToken },
                message: 'Login success',
            });
        }

        // execute this if user login with email and password before receive email OTP CODE
        const { error, errorFields } = validateData({
            requiredField,
            data: payload,
        });
        if (error) {
            throw new ValidationError(`${errorFields} is required!`);
        }

        if (!(await verifyPassword(password, user.password, user.salt))) {
            throw new AuthorizeError('Password incorrect!');
        }

        if (action?.toLowerCase() === 'email-otp') {
            const otpExpired = await sendOTPLogin(user);
            return formatData({
                data: {
                    userId: user._id,
                    otpExpired,
                },
                message: 'OTP has been sent to your email',
            });
        }
    }

    async refreshToken(payload) {
        const { token } = payload;
        if (!token) throw new ValidationError(`refresh_token is required!`);

        const refreshToken = await this.refreshTokenRepo.findOne({
            refreshToken: token,
        });
        if (!refreshToken)
            throw new NotFoundError('We cannot find your token!');

        const result = await verifyRefreshToken(token);

        const newAccessToken = await regenerateAccessToken({
            _id: result.userId,
            roles: result.roles,
        });

        return formatData({
            accessToken: newAccessToken,
            refreshToken: refreshToken.refreshToken,
        });
    }

    async forgetPassword({ email, platform }) {
        if (!email) throw new ValidationError('Email is required!');
        if (!platform) throw new ValidationError('Platform is required!');

        platform = platform.toLowerCase();
        if (platform !== 'website' && platform !== 'mobile') {
            throw new ValidationError(
                'Platform is invalid! Options available is "website" or "mobile"',
            );
        }

        const user = await this.usersRepo.findOne({ email });
        if (!user)
            throw new NotFoundError(
                'We cannot find an account with that email',
            );

        const passToken = await forgetToken.findOne({ userId: user._id });
        if (passToken) await passToken.deleteOne();

        let resetToken = crypto.randomBytes(32).toString('hex');
        const hash = await bcrypt.hash(
            resetToken,
            Number(config.SALT_FORGET_PASSWORD_TOKEN),
        );

        const forgetPass = await forgetToken.findOne({ userId: user._id });
        if (forgetPass) {
            forgetToken.findByIdAndUpdate(
                { userId: user._id },
                { token: hash },
            );
        } else {
            await new forgetToken({
                userId: user._id,
                token: hash,
            }).save();
        }

        let link = `${config.CLIENT_REACT_APP_HOST}/reset-password/${resetToken}/${user._id}`;

        if (platform === 'mobile') {
            const dynamicLink = await generateDynamicLink(resetToken, user._id);
            link = dynamicLink.shortLink;
        }

        const subject = 'Forget Password - Request new password';
        await sendMailRequestNewPassword(email, subject, link);

        return link;
    }
}

export default AuthService;
