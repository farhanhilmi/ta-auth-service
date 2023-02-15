import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userTokenSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true },
        refresh_token: { type: String, required: true },
        createdDate: { type: Date, default: Date.now, expires: 30 * 86400 }, // 30 days
    },
    {
        collection: 'users_token',
    },
);

export default mongoose.model('UserToken', userTokenSchema);
