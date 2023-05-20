import dotenv from 'dotenv';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const NODE_ENV = process.env.NODE_ENV;
const env = `${NODE_ENV}.env`;
console.log('current env:', env);

// const checkEnv = (ENV) => {
//     if (ENV === 'test') {
//         return '../../development.env';
//     } else {
//         return dirname(fileURLToPath(import.meta.url));
//     }
// };

// dotenv.config({
//     path: join(checkEnv(NODE_ENV), `../../${env}`),
// })

// if (NODE_ENV === 'test') {
//     dotenv.config({
//         path: join('../../development.env'),
//     });
// } else {
const basedir = path.resolve(process.cwd());
// const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({
    path: join(basedir, `${NODE_ENV}.env`),
});
// }

const {
    APP_NAME,
    MONGODB_URI,
    DSN_SENTRY,
    PORT,
    REFRESH_TOKEN_PRIVATE_KEY,
    ACCESS_TOKEN_PRIVATE_KEY,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN,
    HOST,
    EMAIL_PASS,
    EMAIL_USER,
    OAUTH_REFRESH_TOKEN,
    OAUTH_CLIENT_SECRET,
    OAUTH_CLIENTID,
    RABBITMQ_URL,
    TZ,
    OTP_EXPIRED,
    SMS_OTP_APP_NAME,
    SMS_OTP_HOST,
    SMS_OTP_URL,
    SMS_OTP_KEY,
    SALT_FORGET_PASSWORD_TOKEN,
    CLIENT_REACT_APP_HOST,

    FIREBASE_DEEP_LINK_URL,
    FIREBASE_DEEP_LINK_DOMAIN_URI_PREFIX,
    DEEP_LINK_URL,
    ANDROID_PACKAGE_NAME,
    EXCHANGE_NAME,
    API_GATEWAY_URL,
    SALT_VERIFICATION_EMAIL_TOKEN,
} = process.env;

const config = {
    app: {
        port: PORT,
        host: HOST,
        name: APP_NAME,
        env: process.env.NODE_ENV,
    },
    db: {
        uri: MONGODB_URI,
    },
    mail: {
        user: EMAIL_USER,
        password: EMAIL_PASS,
        OAUTH_CLIENTID: OAUTH_CLIENTID,
        OAUTH_CLIENT_SECRET: OAUTH_CLIENT_SECRET,
        OAUTH_REFRESH_TOKEN: OAUTH_REFRESH_TOKEN,
    },
    sms: {
        SMS_OTP_APP_NAME,
        SMS_OTP_HOST,
        SMS_OTP_URL,
        SMS_OTP_KEY,
    },
    REFRESH_TOKEN_PRIVATE_KEY,
    ACCESS_TOKEN_PRIVATE_KEY,
    tokenExpires: {
        access: ACCESS_TOKEN_EXPIRES_IN,
        refresh: REFRESH_TOKEN_EXPIRES_IN,
    },
    RABBITMQ: {
        URL: RABBITMQ_URL,
        CHANNEL: {
            BORROWER_SERVICE: 'borrower_service',
            AUTH_SERVICE: 'auth_service',
        },
        EXCHANGE_NAME,
    },
    RABBITMQ_URL,
    DSN_SENTRY,
    OTP_EXPIRED,
    SALT_FORGET_PASSWORD_TOKEN,
    CLIENT_REACT_APP_HOST,
    FIREBASE_DEEP_LINK_URL,
    FIREBASE_DEEP_LINK_DOMAIN_URI_PREFIX,
    DEEP_LINK_URL,
    ANDROID_PACKAGE_NAME,
    API_GATEWAY_URL,
    SALT_VERIFICATION_EMAIL_TOKEN,
};

console.log(`NODE_ENV=${config.app.env}`);
console.log('db', config.db.uri);

export default config;
