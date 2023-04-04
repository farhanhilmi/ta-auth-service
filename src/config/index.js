import dotenv from 'dotenv';

// dotenv.config({
//     path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
//   });

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
    SALT_FORGET_PASSWORD_TOKEN,
    CLIENT_REACT_APP_HOST,
    NODE_ENV,
    FIREBASE_DEEP_LINK_URL,
    FIREBASE_DEEP_LINK_DOMAIN_URI_PREFIX,
    DEEP_LINK_URL,
    ANDROID_PACKAGE_NAME,
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
    NODE_ENV,
    REFRESH_TOKEN_PRIVATE_KEY,
    ACCESS_TOKEN_PRIVATE_KEY,
    tokenExpires: {
        access: ACCESS_TOKEN_EXPIRES_IN,
        refresh: REFRESH_TOKEN_EXPIRES_IN,
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
};

export default config;
