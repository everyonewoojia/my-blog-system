// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 初始化数据库
initDatabase();

// 2. 中间件
app.use(cors());
app.use(express.json()); // 解析 JSON 请求体
app.use(express.static(path.join(__dirname, 'public'))); // 托管静态文件 (CSS, JS, Images)

// 3. 路由
// API 接口
app.use('/api', apiRoutes);

// 前端页面路由 (Serve HTML files)
// 注意：在实际生产中，通常会使用模板引擎如 EJS。
// 这里为了兼容你现有的 HTML，我们直接发送文件。
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'post.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'editor.html'));
});

// 4. 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});