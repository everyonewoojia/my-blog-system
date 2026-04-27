// controllers/userController.js
const User = require('../models/User');

const userController = {
    /**
     * 获取个人资料
     * GET /api/profile
     */
    getProfile: async (req, res) => {
        try {
            const profile = await User.getProfile();
            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('获取个人资料失败:', error);
            res.status(500).json({ 
                success: false, 
                message: '获取资料失败，请稍后重试' 
            });
        }
    },

    /**
     * 更新个人资料
     * POST /api/profile
     */
    updateProfile: async (req, res) => {
        try {
            // 从请求体中解构数据
            const { nickname, bio, avatar_url } = req.body;

            // 基本校验
            if (!nickname) {
                return res.status(400).json({ 
                    success: false, 
                    message: '用户 ID/昵称不能为空' 
                });
            }

            // 调用 Model 层更新数据库
            await User.updateProfile({
                nickname: nickname.trim(),
                bio: bio ? bio.trim() : '',
                avatar_url: avatar_url || '/img/default-avatar.png'
            });

            res.json({
                success: true,
                message: '个人资料已更新'
            });
        } catch (error) {
            console.error('更新个人资料失败:', error);
            res.status(500).json({ 
                success: false, 
                message: '更新失败，数据库错误' 
            });
        }
    }
};

module.exports = userController;