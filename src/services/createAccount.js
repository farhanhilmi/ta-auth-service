import UsersRepository from '../database/repository/users.js';
import { DataConflictError, ValidationError } from '../utils/appErrors.js';
import { formatData, hashPassword, validateData } from '../utils/index.js';

export default async (payload) => {
    const usersRepo = new UsersRepository();

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
        usersRepo.isUserExist(email),
        hashPassword(password),
    ]);

    if (isUserExist.value) {
        throw new DataConflictError(
            'This e-mail address has already been registered',
        );
    }

    const salt = hashedPassword.value.split('.')[0];
    const user = await usersRepo.createUser({
        name,
        email,
        roles,
        password: hashedPassword.value,
        verified: false,
        salt,
    });

    return formatData(user);
};
