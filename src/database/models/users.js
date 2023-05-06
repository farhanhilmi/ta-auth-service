import mongoose from 'mongoose';
// import moment from 'moment-timezone';

const roleOptions = {
    type: String,
    enum: ['lender', 'borrower', 'admin'],
    // default: ['lender'],
};

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: 'Name is required!',
            minlength: 3,
        },
        email: {
            type: String,
            required: 'Email is required!',
            unique: true,
        },
        phoneNumber: {
            type: Number,
            required: 'Phone Number is required!',
        },
        password: {
            type: String,
            minlength: 5,
            required: 'Password is required!',
        },
        salt: {
            type: String,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        roles: roleOptions,
        birthDate: {
            type: String,
            default: false,
        },
        idCardNumber: {
            type: Number,
            default: false,
        },
        idCardImage: {
            type: String,
            default: false,
        },
        faceImage: {
            type: String,
            default: false,
        },
    },
    {
        timestamps: { createdAt: 'createdDate', updatedAt: 'modifyDate' },
        collection: 'users',
    },
);

// userSchema.virtual('adjustedTime').get(function () {
//     return moment.tz(this.sentTime, 'Asia/Jakarta').format();
// });

export default mongoose.model('Users', userSchema);
