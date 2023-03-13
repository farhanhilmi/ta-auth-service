import axios from 'axios';
import {
    addMinutesToDate,
    dateFormatter,
    formatData,
    generateRandomCode,
} from '../utils/index.js';
import config from '../config/index.js';
import OTPRepository from '../database/repository/OTPrepo.js';

const otpRepo = new OTPRepository();

export default async (userId, phoneNumber) => {
    // const userId = '63edc92b7926224a7188b4af';
    const verifyCode = generateRandomCode();
    const options = {
        method: 'POST',
        url: config.sms.SMS_OTP_URL,
        params: {
            phoneNumber,
            verifyCode,
            appName: config.sms.SMS_OTP_APP_NAME,
        },
        headers: {
            'X-RapidAPI-Key': config.sms.SMS_OTP_KEY,
            'X-RapidAPI-Host': config.sms.SMS_OTP_HOST,
        },
    };
    const { data } = await axios.request(options);
    console.log('data', data);
    const otpExpired = dateFormatter(
        addMinutesToDate(new Date(), config.OTP_EXPIRED),
    );
    // console.log('OTP', { verifyCode, otpExpired });

    const userOTP = await otpRepo.findOne({ userId });
    if (!userOTP) await otpRepo.create(userId, verifyCode, otpExpired);
    if (userOTP) {
        otpRepo.updateOTPByUserId(userId, {
            verifyCode,
            expired: otpExpired,
        });
    }

    return otpExpired;
    // axios
    //     .request(options)
    //     .then(function (response) {
    //         console.log(response.data);
    //     })
    //     .catch(function (error) {
    //         console.error(error);
    //     });
};
