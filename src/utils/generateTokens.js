import jwt from 'jsonwebtoken';
import UsersToken from '../database/models/usersToken.js';
import config from '../config/index.js';

export default async (user) => {
    try {
        const payload = { userId: user._id.toString(), roles: user.roles };
        const accessToken = jwt.sign(payload, config.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: config.tokenExpires.access,
        });
        const refreshToken = jwt.sign(
            payload,
            config.REFRESH_TOKEN_PRIVATE_KEY,
            { expiresIn: config.tokenExpires.refresh },
        );

        const userToken = await UsersToken.findOne({ userId: user._id });
        if (userToken) await userToken.remove();

        await new UsersToken({ userId: user._id, refresh_token: refreshToken });
        return Promise.resolve({ accessToken, refreshToken });
    } catch (err) {
        return Promise.reject(err);
    }
};
