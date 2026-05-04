const { db, initDatabase } = require('../../config/database');
const User = require('../../models/User');

beforeAll(() => { initDatabase(); });
beforeEach(() => {
    db.exec('DELETE FROM user_profile;');
    // 插入管理员账户用于测试
    const bcrypt = require('bcryptjs');
    db.prepare(`INSERT INTO user_profile (id, nickname, bio, avatar_url, username, password)
                VALUES (1, 'Admin', 'Bio', '/img/default.png', 'admin', ?)`).run(bcrypt.hashSync('admin123', 10));
});

describe('User Model', () => {
    describe('getProfile', () => {
        test('should return profile with default fields', async () => {
            const profile = await User.getProfile();
            expect(profile.nickname).toBe('Admin');
            expect(profile.username).toBe('admin');
        });
        test('should return default object if not found', async () => {
            db.exec('DELETE FROM user_profile;');
            const profile = await User.getProfile();
            expect(profile.nickname).toBe('默认博主');
        });
    });

    describe('updateProfile', () => {
        test('should update nickname and bio', async () => {
            await User.updateProfile({ nickname: 'NewName', bio: 'NewBio', avatar_url: '/new.png' });
            const updated = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
            expect(updated.nickname).toBe('NewName');
            expect(updated.bio).toBe('NewBio');
            // 确保管理员凭据未被覆盖
            expect(updated.username).toBe('admin');
            expect(updated.password).toBeDefined();
        });
    });

    describe('Error handling', () => {
        let originalPrepare;
        beforeAll(() => { originalPrepare = db.prepare; });
        afterEach(() => { db.prepare = originalPrepare; });

        test('getProfile should throw on error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(User.getProfile()).rejects.toThrow('fail');
        });

        test('updateProfile should throw on error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(User.updateProfile({ nickname: 'x', bio: 'y', avatar_url: 'z' })).rejects.toThrow('fail');
        });
    });
});