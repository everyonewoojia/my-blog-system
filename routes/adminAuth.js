// routes/adminAuth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../config/database');

// 登录接口
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.json({ success: false, message: '用户名和密码不能为空' });
    }
    try {
        const user = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
        if (!user || !user.username) {
            return res.json({ success: false, message: '管理员账户未配置' });
        }
        if (username !== user.username) {
            return res.json({ success: false, message: '用户名或密码错误' });
        }
        const valid = bcrypt.compareSync(password, user.password);
        if (valid) {
            req.session.admin = true;
            req.session.username = user.username;
            return res.json({ success: true, message: '登录成功' });
        } else {
            return res.json({ success: false, message: '用户名或密码错误' });
        }
    } catch (error) {
        console.error('登录接口错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 检查登录状态
router.get('/check', (req, res) => {
    if (req.session && req.session.admin) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// 登出
router.get('/logout', (req, res) => {
    req.session.admin = false;
    req.session.username = null;
    res.json({ success: true, message: '已退出登录' });
});

// 修改管理员凭据
router.put('/credentials', (req, res) => {
    if (!req.session || !req.session.admin) {
        return res.status(401).json({ success: false, message: '请先登录' });
    }
    const { username, password } = req.body;
    if (!username || !password) {
        return res.json({ success: false, message: '用户名和密码不能为空' });
    }
    try {
        const hashed = bcrypt.hashSync(password, 10);
        db.prepare('UPDATE user_profile SET username = ?, password = ? WHERE id = 1').run(username, hashed);
        req.session.username = username;
        res.json({ success: true, message: '管理员凭据已更新' });
    } catch (error) {
        console.error('更新凭据错误:', error);
        res.status(500).json({ success: false, message: '更新失败' });
    }
});

module.exports = router;