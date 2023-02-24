import AuthService from '../services/auth.js';
import UsersModel from '../database/models/users.js';
const authService = new AuthService();

describe('Auth ~ Success Scenario', () => {
    it('must create a new user', async () => {
        const userInput = {
            name: 'Eden Hazard',
            email: 'eden@gmail.com',
            password: 'Test@123',
            salt: 'kfaj73ejfe',
            verified: true,
            roles: 'lender',
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

    it('must get access token by logging in', async () => {
        const userInput = {
            email: 'toni@gmail.com',
            password: '55555',
        };

        const result = await authService.login(userInput);
        expect(result).toHaveProperty('accessToken');
    });

    it('must be able to refresh the user token', async () => {
        const userInput = {
            email: 'toni@gmail.com',
            password: '55555',
        };
        const user = await authService.login(userInput);

        const result = await authService.refreshToken({
            token: user.refreshToken,
        });
        expect(result).toHaveProperty('accessToken');
    });

    it('must be able to verify the OTP email', async () => {
        const userInput = {
            otp: '123456',
        };

        const isTrue = await authService.verifyOTP(userInput);
        expect(isTrue).toBeTruthy();
    });
});
