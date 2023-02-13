import dotenv from 'dotenv';

dotenv.config();

const {
    APP_NAME,
    MONGODB_URI,
    PORT,
    SECRET_TOKEN,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN,
    HOST,
    EMAIL_PASS,
    EMAIL_USER,
    OAUTH_REFRESH_TOKEN,
    OAUTH_CLIENT_SECRET,
    OAUTH_CLIENTID,
    RABBITMQ_URL,
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
    SECRET_TOKEN,
    tokenExpires: {
        access: ACCESS_TOKEN_EXPIRES_IN,
        refresh: REFRESH_TOKEN_EXPIRES_IN,
    },
    RABBITMQ_URL,
};

export default config;
