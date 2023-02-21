import OTPModel from '../models/OTPModel.js';

export default class OTPRepository {
    constructor() {
        this.model = OTPModel;
    }

    async findOne(query, projection = { __v: 0 }, options = {}) {
        return await this.model.findOne(query, projection, options).exec();
    }

    async create(userId, otp, expired) {
        return await this.model.create({
            userId,
            otp,
            expired,
        });
    }

    async updateOTPByUserId(userId, { otp, expired }, options = { new: true }) {
        const payload = { otp, expired };
        return await this.model.updateOne({ userId }, payload, options);
    }
}
