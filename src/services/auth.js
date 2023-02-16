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

class AuthService {
    constructor() {
        this.usersRepo = new UsersRepository();
        this.refreshTokenRepo = new RefreshTokenRepository();
    }

    async getUserData(data) {
        const { userId, roles } = data;
        if (!userId || !roles) {
            throw new ValidationError('userId & roles is required!');
        }
        const user = await this.usersRepo.findById(userId);
        console.log('user', user);
        if (!user) {
            throw new NotFoundError('Data not found!');
        }
        if ((user && user?.roles != roles) || user?.roles != 'admin') {
            throw new Error('You do not have access to this resource');
        }

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
        const user = await this.usersRepo.createUser({
            name,
            email,
            roles,
            password: hashedPassword.value,
            verified: false,
            salt,
        });

        return formatData(user);
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

        // if (result.exp < Date.now() / 1000) {
        //     throw new AuthorizeError(
        //         'Refresh token was expired. Please make a new signin request',
        //     );
        // }

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
