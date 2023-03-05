import { ValidationError } from '../utils/appErrors.js';
import OTPRepository from '../database/repository/OTPrepo.js';

export default async (userId, otp) => {
    if (!userId) throw new ValidationError('UserId is required');
    if (!otp) throw new ValidationError('OTP Code is required');
    const otpRepo = new OTPRepository();
    console.log('userId', userId);
    console.log('otp', otp);

    const dataOtp = await otpRepo.findOne({ otp, userId });

    if (!dataOtp) {
        throw new ValidationError(
            "OTP code doesn't match. Please check again!",
        );
    }

    await otpRepo.deleteOTP(userId);

    return true;
};
