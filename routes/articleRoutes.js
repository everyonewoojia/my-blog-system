// routes/articleRoutes.js 完整代码
const express = require('express');
const router = express.Router();
const path = require('path');

// 对应访问路径：GET /admin/articles
router.get('/articles', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

// 如果需要新建文章页面的跳转
router.get('/new', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'editor.html'));
});

module.exports = router;