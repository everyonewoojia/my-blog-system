const userController = require('../../controllers/userController');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('User Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { body: {} };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    });

    describe('getProfile', () => {
        test('should return profile data', async () => {
            User.getProfile.mockResolvedValue({ nickname: 'Test' });
            await userController.getProfile(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: { nickname: 'Test' } });
        });
    });

    describe('updateProfile', () => {
        test('should reject empty nickname', async () => {
            req.body = { nickname: '' };
            await userController.updateProfile(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
        test('should update profile successfully', async () => {
            User.updateProfile.mockResolvedValue(true);
            req.body = { nickname: 'New', bio: 'NewBio' };
            await userController.updateProfile(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: '个人资料已更新' });
        });
    });
});