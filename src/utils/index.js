import crypto from 'crypto';

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
