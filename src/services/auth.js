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
import generateTokens from '../utils/generateTokens.js';

class AuthService {
    constructor() {
        this.usersRepo = new UsersRepository();
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
        return formatData({ accessToken, refreshToken });
    }
}

export default AuthService;
