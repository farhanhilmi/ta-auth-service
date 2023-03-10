import OTPRepository from '../database/repository/OTPrepo.js';
import { ValidationError } from '../utils/appErrors.js';
import { dateFormatter, validateData } from '../utils/index.js';

const otpRepo = new OTPRepository();

export default async (otp, userId) => {
    // const { otp, userId } = payload;
    // const requiredField = { otp, userId };

    // const { error, errorFields } = validateData({
    //     requiredField,
    //     data: payload,
    // });

    // if (error) {
    //     throw new ValidationError(`${errorFields} is required!`);
    // }
    // const user = await this.usersRepo.findOne({ email });
    // if (user?.verified) {
    //     throw new ValidationError('Sudah terverifikasi');
    // }
    const dataOTP = await otpRepo.findOne({ userId });

    const newDate = dateFormatter(new Date());
    // console.log('newDate', newDate);
    // console.log('dataOTP', dataOTP);

    if (newDate > dataOTP.expired) {
        throw new ValidationError('OTP Code is expired');
    }

    if (otp != dataOTP?.otp) {
        throw new ValidationError(
            "OTP code doesn't match. Please check again!",
        );
    }
    await otpRepo.deleteOTP(userId);

    return true;
};
