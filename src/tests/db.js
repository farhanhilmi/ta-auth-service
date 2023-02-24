import mongoose, { set } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

mongoose.promise = global.Promise;

let mongoServer;

const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const connect = async () => {
    set('strictQuery', false);
    await mongoose.disconnect();

    mongoServer = await MongoMemoryServer.create();

    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, opts, (err) => {
        if (err) {
            console.error(err);
        }
    });
};

const close = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
};

const clear = async () => {
    const { collections } = mongoose.connection;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

export default {
    connect,
    close,
    clear,
};
