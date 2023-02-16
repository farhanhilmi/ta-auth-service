import _ from 'underscore';
import Users from '../models/users.js';

class UsersRepository {
    async createUser({ roles, name, email, password, salt }) {
        const user = await Users.create({
            roles,
            name,
            email,
            password,
            salt,
        });
        const result = JSON.stringify(user);
        return _.omit(JSON.parse(result), 'password', 'salt', '__v');
    }

    async find({
        query,
        projection = { __v: 0, salt: 0 },
        sort = { createdDate: 1 },
        options = {},
    }) {
        return await Users.find(query, projection, options)
            .sort(sort)
            .select({ __v: 0 })
            .exec();
    }

    async findById(id, projection = { __v: 0, salt: 0 }, options = {}) {
        return await Users.findById(id, projection, options).exec();
    }

    async findOne(query, projection = { __v: 0, salt: 0 }, options = {}) {
        return await Users.findOne(query, projection, options).exec();
    }

    async updateUserById(
        id,
        { roles, name, email, password },
        options = { new: true },
    ) {
        const payload = { roles, name, email, password };
        return await Users.findByIdAndUpdate(id, payload, options).exec();
    }

    async updateSalt(id, salt, options = { new: true }) {
        return await Users.findByIdAndUpdate(id, { salt }, options).exec();
    }

    async deleteUser(id) {
        return await Users.findByIdAndDelete(id).exec();
    }

    async isUserExist(email) {
        return await Users.exists({ email }).exec();
    }

    async createToken(user) {
        let expiredAt = new Date();

        expiredAt.setSeconds(
            expiredAt.getSeconds() + config.tokenExpires.refresh,
        );

        const _token = uuidv4();

        const _object = new this({
            token: _token,
            user: user._id,
            expiryDate: expiredAt.getTime(),
        });

        console.log(_object);

        let refreshToken = await _object.save();

        return refreshToken.token;
    }
}

export default UsersRepository;
