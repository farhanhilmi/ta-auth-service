import dotenv from 'dotenv';

dotenv.config();

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
} = process.env;

const config = {
    app: {
        port: PORT,
        host: HOST,
        name: APP_NAME,
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
    RABBITMQ_URL,
    DSN_SENTRY,
    OTP_EXPIRED,
};

export default config;
