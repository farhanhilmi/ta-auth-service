import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { ValidationError } from '../../utils/appErrors.js';

import UsersRepository from '../../database/repository/users.js';
import forgetTokenModel from '../../database/models/forgetToken.js';
import config from '../../config/index.js';
import { sendMailRequestNewPassword } from '../../utils/mail/index.js';
import { generateDynamicLink } from '../../utils/firebase.js';

const userRpo = new UsersRepository();

export default async ({ email, platform }) => {
    if (!email) throw new ValidationError('Email is required!');
    if (!platform) throw new ValidationError('Platform is required!');
    platform = platform.toLowerCase();
    console.log('platform', platform);
    if (platform !== 'website' && platform !== 'mobile') {
        throw new ValidationError(
            'Platform is invalid! Options available is "website" or "mobile"',
        );
    }

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

    let link = `${config.CLIENT_REACT_APP_HOST}/reset-password/${resetToken}/${user._id}`;

    if (platform === 'mobile') {
        const dynamicLink = await generateDynamicLink(resetToken, user._id);
        link = dynamicLink.shortLink;
    }

    const subject = 'Forget Password - Request new password';
    await sendMailRequestNewPassword(email, subject, link);

    return link;
};
