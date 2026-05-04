// models/User.js
const { db } = require('../config/database');

class UserModel {
    /**
     * 获取博主个人资料
     * 因为是个人博客，我们约定 ID 为 1 的记录即为博主信息
     */
    static async getProfile() {
        try {
            const stmt = db.prepare('SELECT * FROM user_profile WHERE id = 1');
            const profile = stmt.get();
            
            // 如果数据库意外为空，返回一个默认对象防止前端报错
            return profile || {
                id: 1,
                nickname: '默认博主',
                bio: '欢迎来到我的博客！',
                avatar_url: '/img/default-avatar.png'
            };
        } catch (error) {
            console.error('Database Error (getProfile):', error);
            throw error;
        }
    }

    /**
     * 更新博主个人资料
     * 使用 INSERT OR REPLACE 确保 ID 为 1 的记录被更新
     * @param {Object} data - 包含 nickname, bio, avatar_url 的对象
     */
    static async updateProfile(data) {
        try {
            // 只更新资料字段，不覆盖 username/password
            const stmt = db.prepare(`
                UPDATE user_profile
                SET nickname = @nickname, bio = @bio, avatar_url = @avatar_url,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `);
            stmt.run({
                nickname: data.nickname,
                bio: data.bio,
                avatar_url: data.avatar_url
            });
            return true;
        } catch (error) {
            console.error('Database Error (updateProfile):', error);
            throw error;
        }
    }
}

module.exports = UserModel;