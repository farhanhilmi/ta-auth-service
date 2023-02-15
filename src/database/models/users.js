import mongoose from 'mongoose';

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
    },
    {
        timestamps: { createdAt: 'createdDate', updatedAt: 'modifyDate' },
        collection: 'users',
    },
);

export default mongoose.model('Users', userSchema);
