import UsersRepository from '../database/repository/users.js';
import {
    formatData,
    hashPassword,
    validateData,
    verifyPassword,
} from '../utils/index.js';
import {
    AuthorizeError,
    DataConflictError,
    NotFoundError,
    ValidationError,
} from '../utils/appErrors.js';
import {
    generateTokens,
    regenerateAccessToken,
    verifyRefreshToken,
} from '../utils/jwtToken.js';
import RefreshTokenRepository from '../database/repository/refreshTokenRepo.js';
import { sendMailOTP } from '../utils/mail/index.js';
import OTPRepository from '../database/repository/OTPrepo.js';
import sendSmsOtp from './sendSmsOtp.js';
import verifySmsOtp from './verifySmsOtp.js';

class AuthService {
    constructor() {
        this.usersRepo = new UsersRepository();
        this.refreshTokenRepo = new RefreshTokenRepository();
        this.otpRepo = new OTPRepository();
    }

    async getUserData(data) {
        const { userId, roles } = data;
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

        const [isUserExist, hashedPassword] = await Promise.allSettled([
            this.usersRepo.isUserExist(email),
            hashPassword(password),
        ]);

        if (isUserExist.value) {
            throw new DataConflictError(
                'This e-mail address has already been registered',
            );
        }
        console.log('phoneNumber', phoneNumber);
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

        let otpExpiredTime;

        if (user) {
            const { otp, otpExpired } = await sendMailOTP(email);
            otpExpiredTime = otpExpired;
            const userOTP = await this.otpRepo.findOne({ userId: user._id });
            if (!userOTP) this.otpRepo.create(user._id, otp, otpExpired);
            if (userOTP) {
                this.otpRepo.updateOTPByUserId(user._id, {
                    otp,
                    expired: otpExpired,
                });
            }
        }
        return formatData({ ...user, otpExpired: otpExpiredTime });
    }

    async login(payload, action = false) {
        const { email, password, otp } = payload;
        const requiredField = { email, password };
        const user = await this.usersRepo.findOne({ email }, { __v: 0 });

        if (action?.toLowerCase() === 'login') {
            await verifySmsOtp(user._id, otp);
            const { accessToken, refreshToken } = await generateTokens(user);
            await this.refreshTokenRepo.create(user._id, refreshToken);

            return formatData({ accessToken, refreshToken });
        }

        const { error, errorFields } = validateData({
            requiredField,
            data: payload,
        });
        if (error) {
            throw new ValidationError(`${errorFields} is required!`);
        }

        if (!user) throw new NotFoundError('User not found!');
        if (!(await verifyPassword(password, user.password, user.salt))) {
            throw new AuthorizeError('Password incorrect!');
        }

        console.log('user', user);

        if (!user.verified)
            throw new AuthorizeError('Your email is not verified!');

        if (action?.toLowerCase() === 'sms-otp') {
            const { otp, otpExpired } = await sendMailOTP(email);
            const userOTP = await this.otpRepo.findOne({ userId: user._id });
            if (!userOTP) this.otpRepo.create(user._id, otp, otpExpired);
            if (userOTP) {
                this.otpRepo.updateOTPByUserId(user._id, {
                    otp,
                    expired: otpExpired,
                });
            }

            // const otpExpired = await sendSmsOtp(user._id, user.phoneNumber);
            return formatData({ userId: user._id, otpExpired });
        }
    }

    async verifyOTPEmail(payload) {
        const { otp, userId } = payload;
        const requiredField = { otp, userId };

        const { error, errorFields } = validateData({
            requiredField,
            data: payload,
        });

        if (error) {
            throw new ValidationError(`${errorFields} is required!`);
        }
        const user = await this.usersRepo.findOne({ _id: userId });
        if (user?.verified) {
            throw new ValidationError('Sudah terverifikasi');
        }
        const dataOTP = await this.otpRepo.findOne({ userId });

        if (otp != dataOTP?.otp) {
            throw new ValidationError(
                "OTP code doesn't match. Please check again!",
            );
        }
        await this.otpRepo.deleteOTP(userId);
        await this.usersRepo.updateVerifiedUser(userId, true);

        return formatData({
            success: true,
            otp: dataOTP.otp,
            otp_input: otp,
        });
    }

    async refreshToken(payload) {
        const { token } = payload;
        if (!token) throw new ValidationError(`refresh_token is required!`);

        const refreshToken = await this.refreshTokenRepo.findOne({
            refreshToken: token,
        });
        if (!refreshToken) throw new NotFoundError('Data not found!');

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
}

export default AuthService;
