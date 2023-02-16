import crypto from 'crypto';
import moment from 'moment-timezone';
import { APIError } from './appErrors.js';

export const getCurrentJakartaTime = () => {
    return moment.tz(Date.now(), 'Asia/Jakarta');
};

export const formatData = (data) => {
    if (data) {
        return data;
    } else {
        throw new Error('Data Not found!');
    }
};

/**
 *
 * @param {String} password user password plain text
 * @returns {Promise} hash password
 */
export const hashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('base64');

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}.${derivedKey.toString('base64')}`);
        });
    });
};

/**
 *
 * @param {String} password user password plain text
 * @param {String} hash hash password
 * @param {String} salt salt password
 * @returns {Promise} true | false
 */
export const verifyPassword = async (password, hash, salt) => {
    return new Promise((resolve, reject) => {
        const key = hash.split('.')[1];
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(key === derivedKey.toString('base64'));
        });
    });
};

export const validateData = ({ requiredField, data }) => {
    const errorFields = [];
    for (const key in requiredField) {
        if (!data[key]) {
            errorFields.push(key);
        }
    }

    return { error: errorFields.length > 0, errorFields };
};

export const generateRandomCode = () => {
    return Math.floor(Math.random() * 90000) + 10000;
};

// To add minutes to the current time
export const addMinutesToDate = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};

// https://stackoverflow.com/questions/43341823/javascript-date-to-string-with-iso-format-with-timezone
export const dateFormatter = (date, format) => {
    const timezone = 'Asia/Jakarta';
    // Validate that the time zone is supported
    if (!moment.tz.zone(timezone)) {
        return APIError('Unknown time zone: "' + timezone + '"');
    }
    // Use current date if not supplied
    date = date || new Date();
    // Use default format if not supplied
    format = format || 'YYYY-MM-DDTHH:mm:ssZZ';
    return moment(date).tz(timezone).format(format);
};
