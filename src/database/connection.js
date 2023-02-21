import mongoose, { set } from 'mongoose';
import config from '../config/index.js';

// export default async () => {
//     try {
//         set('strictQuery', false);
//         await mongoose.connect(config.db.uri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             // useCreateIndex: true,
//         });
//         console.log('Db Connected');
//     } catch (err) {
//         console.error('Error ============ ON DB Connection');
//         console.log(err);
//     }
// };

// export default conn;

// export default async () => {
set('strictQuery', false);
mongoose.connect(config.db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false,
    // useCreateIndex: true,
});

const conn = mongoose.connection;
conn.on('error', () =>
    console.error.bind(console, 'database connection error'),
);
conn.once('open', () => console.info('Connection to Database is successful'));

export default conn;
// };
