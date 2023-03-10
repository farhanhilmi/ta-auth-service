import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { ValidationError } from '../../utils/appErrors.js';

import UsersRepository from '../../database/repository/users.js';
import forgetTokenModel from '../../database/models/forgetToken.js';
import config from '../../config/index.js';
import { sendMailRequestNewPassword } from '../../utils/mail/index.js';

const userRpo = new UsersRepository();

export default async (email) => {
    if (!email) throw new ValidationError('Email is required!');

    const user = await userRpo.findOne({ email });
    if (!user) throw new ValidationError('User not found!');

    const passToken = await forgetTokenModel.findOne({ userId: user._id });
    if (passToken) await passToken.deleteOne();

    let resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(
        resetToken,
        Number(config.SALT_FORGET_PASSWORD_TOKEN),
    );

    await new forgetTokenModel({
        userId: user._id,
        token: hash,
    }).save();

    const link = `${config.CLIENT_REACT_APP_HOST}/reset-password/${resetToken}/${user._id}`;
    const subject = 'Forget Password - Request new password';
    await sendMailRequestNewPassword(email, subject, link);

    return link;
};
