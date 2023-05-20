import { jest } from '@jest/globals';
import { when } from 'jest-when';
import db from './db.js';
import AuthService from '../services/auth.js';

// import db from './db.js';
// import BeratRepository from '../database/repository/beratRepo.js';
// import BeratModel from '../database/models/beratBadan.js';
// import UsersModel from '../database/models/users.js';
// import AuthService from '../services/auth.js';
import * as Utils from '../utils/mail/index.js';

const resultData = [
    {
        _id: '6445ffa60cfd73ccc903960c',
        name: 'Toni Kroos',
        email: 'toni@gmail.com',
        password:
            'mQHY/dde46oVJGfF/7W2Gw==.BHVolSYzOG1IYQ06gOQgvDIQKqSmfvmvfdpEjnUvnHiu9dvlcbFAbBshHXpUI/SKO9XyptTc+Xxo48AFV6sa9w==',
        salt: 'mQHY/dde46oVJGfF/7W2Gw==',
        verified: true,
        roles: 'lender',
        phoneNumber: '089283823',
        createdDate: '1682308371168',
        modifyDate: '1682308391600',
        __v: 0,
    },
    {
        _id: '6445fd1319df4e1b0146d8b8',
        name: 'Luka Modric',
        email: 'modric@gmail.com',
        password:
            'mQHY/dde46oVJGfF/7W2Gw==.BHVolSYzOG1IYQ06gOQgvDIQKqSmfvmvfdpEjnUvnHiu9dvlcbFAbBshHXpUI/SKO9XyptTc+Xxo48AFV6sa9w==',
        salt: 'mQHY/dde46oVJGfF/7W2Gw==',
        verified: false,
        roles: 'borrower',
        phoneNumber: '089283822',
        createdDate: '1682308371168',
        modifyDate: '1682308391600',
        __v: 0,
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
    // jest.mock('./../config/meta/importMetaUrl', () => ({
    //     importMetaUrl: () => 'http://www.example.org',
    // }));

    Utils.sendMailOTP = jest.fn().mockResolvedValue({
        otp: '23456',
        otpExpired: '2020-10-10',
    });

    // jest.setTimeout(60000);
    await db.connect();
});

beforeEach(async () => {
    // const auth = new AuthService();
    // await Promise.all(resultData.map((item) => auth.createAccount(item)));
    // await UsersModel.findOneAndUpdate(
    //     { email: resultData[1].email },
    //     { verified: true },
    // );
    // await db.connect();
    const DB = await db.getDB();
    await DB.collection('users').insertMany(resultData);
});

afterEach(async () => {
    await db.clear();
});

afterAll(async () => {
    await db.close();
});
