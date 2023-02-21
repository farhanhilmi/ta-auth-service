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
        const { name, email, password, roles } = payload;
        const requiredField = { name, email, password, roles };

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

        const salt = hashedPassword.value.split('.')[0];
        // console.log('connection', Object.getOwnPropertyNames(connection));

        const user = await this.usersRepo.createUser({
            name,
            email,
            roles,
            password: hashedPassword.value,
            verified: false,
            salt,
        });

        let otpExpiredTime;

        if (user) {
            const { otp, otpExpired } = sendMailOTP(email);
            otpExpiredTime = otpExpired;
            this.otpRepo.create(user._id, otp, otpExpired);
        }
        return formatData({ ...user, otpExpired: otpExpiredTime });
    }

    async login(payload) {
        const { email, password } = payload;
        const requiredField = { email, password };

        const { error, errorFields } = validateData({
            requiredField,
            data: payload,
        });
        if (error) {
            throw new ValidationError(`${errorFields} is required!`);
        }

        const user = await this.usersRepo.findOne({ email }, { __v: 0 });
        if (!user) throw new NotFoundError('User not found!');
        if (!(await verifyPassword(password, user.password, user.salt))) {
            throw new AuthorizeError('Password incorrect!');
        }

        const { accessToken, refreshToken } = await generateTokens(user);
        await this.refreshTokenRepo.create(user._id, refreshToken);

        return formatData({ accessToken, refreshToken });
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
