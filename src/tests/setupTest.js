import { jest } from '@jest/globals';
import { when } from 'jest-when';
import db from './db.js';

// import db from './db.js';
// import BeratRepository from '../database/repository/beratRepo.js';
// import BeratModel from '../database/models/beratBadan.js';
import UsersModel from '../database/models/users.js';
import AuthService from '../services/auth.js';

const resultData = [
    {
        _id: '63edc92b7926224a7188b4ac',
        name: 'Toni Kroos',
        email: 'toni@gmail.com',
        password: '55555',
        salt: 'kfaj73ejfe',
        verified: true,
        roles: 'lender',
    },
    {
        _id: '63edc92b7926224a7188b4ab',
        name: 'Luka Modric',
        email: 'modric@gmail.com',
        password: '343432',
        salt: 'fsf3434hafa',
        verified: true,
        roles: 'borrower',
    },
];

// beforeAll(async () => {
//     // jest.spyOn(UsersModel, 'findById').mockReturnValue(
//     //     Promise.resolve({
//     //         _id: '63edc92b7926224a7188b4ac',
//     //         name: 'Eden Hazard',
//     //         email: 'eden@gmail.com',
//     //         password: '133',
//     //         salt: 'kfaj73ejfe',
//     //         verified: true,
//     //         roles: 'lender',
//     //     }).then(() => ({ exec: jest.spyOn(UsersModel, 'exec') })),
//     // );
//     // UsersModel.findById = jest.fn().mockImplementation(() => ({
//     //     exec: jest
//     //         .fn()
//     //         .mockResolvedValue([
//     //             { _id: '63edc92b7926224a7188b4ac' },
//     //             { _id: '63edc92b7926224a7188b4aa' },
//     //         ]),
//     // }));
//     // const findByIdMock = jest.spyOn(UsersModel, 'findById');
//     // const results = resultData;
//     // const usersRes = jest.fn((ya) => {
//     //     console.log('YAA', ya);
//     // });
//     // const AccountFindResult = {
//     //     exec: usersRes,
//     // };
//     // const AccountFind = jest.fn(() => AccountFindResult);
//     // findByIdMock.mockImplementation(AccountFind);
// });

beforeAll(async () => {
    jest.setTimeout(60000);
    await db.connect();
});

beforeEach(async () => {
    const auth = new AuthService();
    await Promise.all(resultData.map((item) => auth.createAccount(item)));
});

afterEach(async () => {
    await db.clear();
});

afterAll(async () => {
    await db.close();
});
