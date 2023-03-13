import AuthService from '../services/auth.js';
import UsersModel from '../database/models/users.js';
import verifyLoginOTP from '../services/verifyLoginOTP.js';
import refreshTokenModel from '../database/models/refreshToken.js';
import OTPModel from '../database/models/OTPModel.js';
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
            password: 'Test@123',
            salt: 'kfaj73ejfe',
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
            password: '343432',
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
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2VkYzkyYjc5MjYyMjRhNzE4OGI0YWYiLCJyb2xlcyI6ImJvcnJvd2VyIiwiaWF0IjoxNjc2NTI5MjgyLCJleHAiOjE2NzkxMjEyODJ9.4sstVsYCK01F--fWJbog22onNnpJzPgazLXtVOJPnj8',
                }),
            }));

        const result = await authService.refreshToken({
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2VkYzkyYjc5MjYyMjRhNzE4OGI0YWYiLCJyb2xlcyI6ImJvcnJvd2VyIiwiaWF0IjoxNjc2NTI5MjgyLCJleHAiOjE2NzkxMjEyODJ9.4sstVsYCK01F--fWJbog22onNnpJzPgazLXtVOJPnj8',
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
