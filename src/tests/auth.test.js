import AuthService from '../services/auth.js';
import UsersModel from '../database/models/users.js';
import verifyLoginOTP from '../services/verifyLoginOTP.js';
import refreshTokenModel from '../database/models/refreshToken.js';
import OTPModel from '../database/models/OTPModel.js';
import { ValidationError } from '../utils/appErrors.js';
// import { sendMailOTP } from '../utils/mail/index.js';
const authService = new AuthService();

const refreshTokenMockedData = {
    get: (v) => v,
};

let objectSpy;

describe('Auth ~ Success Scenario', () => {
    it('must create a new user', async () => {
        const userInput = {
            name: 'Eden Hazard',
            email: 'eden@gmail.com',
            password: 'Jari$yaya',
            // salt: 'kfaj73ejfe',
            verified: true,
            roles: 'lender',
            phoneNumber: '0892838232',
        };

        const result = await authService.createAccount(userInput);
        expect(result).toHaveProperty('email', userInput.email);
    });

    it('must get user data', async () => {
        const userId = await UsersModel.findOne({ email: 'toni@gmail.com' });
        const userInput = {
            userId: userId._id,
            roles: 'lender',
        };

        const result = await authService.getUserData(userInput);
        expect(result).toHaveProperty('roles', 'lender');
        expect(result).toHaveProperty('name', 'Toni Kroos');
    });

    it('must get otp expired by logging in', async () => {
        const userInput = {
            email: 'modric@gmail.com',
            password: 'Jari$yaya',
        };

        const result = await authService.login(userInput, 'email-otp');
        expect(result).toHaveProperty('otpExpired');
    });

    it('must be able to refresh the user token', async () => {
        // const userInput = {
        //     email: 'modric@gmail.com',
        //     password: '343432',
        // };
        // const expectedReturn = true;
        // jest.spyOn(authService, '').mockReturnValue('mocked');
        // // const spy = jest.spyOn(verifyLoginOTP, 'verifyLoginOTP');
        // // spy.mockReturnValue(expectedReturn);

        // const user = await authService.login(userInput, 'login');
        // console.log('user', user);

        // objectSpy = jest.spyOn(refreshTokenModel, 'findOne');
        // objectSpy.mockReturnValue(() => ({
        //     exec: () => ({ ajaja: 'adad' }),
        // }));

        objectSpy = jest
            .spyOn(refreshTokenModel, 'findOne')
            .mockImplementationOnce(() => ({
                exec: () => ({
                    userId: '613712f7b7025984b080cea9',
                    refreshToken:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDBhZWM1ZGU4N2Y0MTdmYWE0MTA2NWQiLCJyb2xlcyI6ImJvcnJvd2VyIiwiaWF0IjoxNjgwNjcwMjg3LCJleHAiOjE2ODMyNjIyODd9.ByKDkYerV5uaguFn3mKEPVGAV_r3aZsock1EauuIRkg',
                }),
            }));

        const result = await authService.refreshToken({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDBhZWM1ZGU4N2Y0MTdmYWE0MTA2NWQiLCJyb2xlcyI6ImJvcnJvd2VyIiwiaWF0IjoxNjgwNjcwMjg3LCJleHAiOjE2ODMyNjIyODd9.ByKDkYerV5uaguFn3mKEPVGAV_r3aZsock1EauuIRkg',
        });
        objectSpy.mockClear();
        expect(result).toHaveProperty('accessToken');
    });

    it('must be able to verify the OTP email', async () => {
        objectSpy = jest
            .spyOn(OTPModel, 'findOne')
            .mockImplementationOnce(() => ({
                exec: () => ({
                    userId: '63edc92b7926224a7188b4ab',
                    otp: '55432',
                }),
            }));

        const userInput = {
            otp: '55432',
            userId: '63edc92b7926224a7188b4ab',
        };

        const result = await authService.verifyOTPEmail(userInput);
        expect(result.success).toBeTruthy();
    });
});

describe('Auth ~ Bad Scenario', () => {
    it('must return error when create a new user with no password, roles, phoneNumber', async () => {
        const userInput = {
            name: 'Eden Hazard',
            email: 'eden@gmail.com',
        };

        // expect(async () => await authService.createAccount(userInput)).toThrow(
        //     'password,roles,phoneNumber is required!',
        // );
        await expect(() =>
            authService.createAccount(userInput),
        ).rejects.toThrow('password,roles,phoneNumber is required!');
        // const t = async () => {
        //     const result = await authService.createAccount(userInput);
        //     throw new TypeError(result);
        // };
        // console.log('t', t);
        // expect(t).toThrow(TypeError);
        // expect(t).toThrow('UNKNOWN ERROR');
        // try {
        //     const userInput = {
        //         name: 'Eden Hazard',
        //         email: 'eden@gmail.com',
        //     };
        //     await authService.createAccount(userInput);
        // } catch (error) {
        //     const expected = 'password,roles,phoneNumber is required!';
        //     expect(error).toBeInstanceOf(ValidationError);
        //     expect(error).toHaveProperty('message', expected);
        // }
    });

    it('must return error when create a new user with bad password', async () => {
        const userInput = {
            name: 'Eden Hazard',
            email: 'eden@gmail.com',
            password: '12345',
            salt: 'kfaj73ejfe',
            verified: true,
            roles: 'lender',
            phoneNumber: '0892838232',
        };

        // expect(async () => await authService.createAccount(userInput)).toThrow(
        //     'password,roles,phoneNumber is required!',
        // );
        const expected =
            'Password must be 8 characters long, contain at least one uppercase letter, one lowercase letter, and one special character';
        await expect(() =>
            authService.createAccount(userInput),
        ).rejects.toThrow(expected);
    });

    it('must return error when create account with existing email', async () => {
        const userInput = {
            name: 'Eden Hazard',
            email: 'toni@gmail.com',
            password: '12345Jaijde$',
            salt: 'kfaj73ejfe',
            verified: true,
            roles: 'lender',
            phoneNumber: '0892838232',
        };

        const expected = 'This e-mail address has already been registered';
        await expect(() =>
            authService.createAccount(userInput),
        ).rejects.toThrow(expected);
    });
});
