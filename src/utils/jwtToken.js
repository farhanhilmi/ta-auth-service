import jwt from 'jsonwebtoken';
import RefreshToken from '../database/models/refreshToken.js';
import config from '../config/index.js';
import { AuthorizeError } from './appErrors.js';

export const generateTokens = async (user) => {
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

        const userToken = await RefreshToken.findOne({ userId: user._id });
        if (userToken) await userToken.remove();

        await new RefreshToken({
            userId: user._id,
            refresh_token: refreshToken,
        });
        return Promise.resolve({ accessToken, refreshToken });
    } catch (err) {
        return Promise.reject(err);
    }
};

export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.REFRESH_TOKEN_PRIVATE_KEY);
        return Promise.resolve(decoded);
    } catch (err) {
        return Promise.reject(new AuthorizeError(err.message));
    }
};

export const regenerateAccessToken = async (user) => {
    try {
        const payload = { userId: user._id.toString(), roles: user.roles };
        const accessToken = jwt.sign(payload, config.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: config.tokenExpires.access,
        });

        return Promise.resolve(accessToken);
    } catch (err) {
        return Promise.reject(new AuthorizeError(err.message));
    }
};
