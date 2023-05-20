import verifyToken from '../database/models/verifyToken.js';
import UsersRepository from '../database/repository/users.js';
import AuthService from '../services/auth.js';
import bcrypt from 'bcrypt';
const authService = new AuthService();

describe('Verificatin email ~ Success scenario', () => {
    beforeAll(async () => {
        jest.spyOn(UsersRepository.prototype, 'findById').mockReturnValue({
            _id: '6445ffa60cfd73ccc903960c',
            email: 'toni@gmail.com',
            verified: false,
        });

        jest.spyOn(
            UsersRepository.prototype,
            'updateVerifiedUser',
        ).mockReturnValue({
            _id: '6445ffa60cfd73ccc903960c',
            email: 'toni@gmail.com',
            roles: 'lender',
        });

        jest.spyOn(verifyToken, 'findOne').mockImplementationOnce(() => ({
            userId: '6445ffa60cfd73ccc903960c',
            token: '1724cf0bfbd86376e93bc923b29e6935178ec5100057b9ad90feffebff224232',
        }));

        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => true);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    it('should verify user email', async () => {
        const result = await authService.verifyEmailAccount(
            '6445ffa60cfd73ccc903960c',
            '1724cf0bfbd86376e93bc923b29e6935178ec5100057b9ad90feffebff224232',
        );
        expect(result.data).toHaveProperty(
            'userId',
            '6445ffa60cfd73ccc903960c',
        );
    });
});

describe('Verificatin email ~ Bad scenario', () => {
    beforeAll(async () => {
        jest.spyOn(UsersRepository.prototype, 'findById').mockReturnValue({
            _id: '6445ffa60cfd73ccc903960c',
            email: 'toni@gmail.com',
            verified: true,
        });

        jest.spyOn(
            UsersRepository.prototype,
            'updateVerifiedUser',
        ).mockReturnValue({
            _id: '6445ffa60cfd73ccc903960c',
            email: 'toni@gmail.com',
            roles: 'lender',
        });

        jest.spyOn(verifyToken, 'findOne').mockImplementationOnce(() => ({
            userId: '6445ffa60cfd73ccc903960c',
            token: '1724cf0bfbd86376e93bc923b29e6935178ec5100057b9ad90feffebff224232',
        }));
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should throw error when email already verified ', async () => {
        await expect(() =>
            authService.verifyEmailAccount(
                '6445ffa60cfd73ccc903960c',
                '1724cf0bfbd86376e93bc923b29e6935178ec5100057b9ad90feffebff224232',
            ),
        ).rejects.toThrow('Your account already verified');
    });

    it('should throw error when parameter missing', async () => {
        await expect(() =>
            authService.verifyEmailAccount('6445ffa60cfd73ccc903960c'),
        ).rejects.toThrow('userId & token is required!');
    });
});
