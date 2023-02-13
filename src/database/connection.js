import mongoose, { set } from 'mongoose';
import config from '../config/index.js';

export default async () => {
    try {
        set('strictQuery', false);
        await mongoose.connect(config.db.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
        });
        console.log('Db Connected');
    } catch (err) {
        console.error('Error ============ ON DB Connection');
        console.log(err);
    }
};
