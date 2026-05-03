// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const { initDatabase } = require('./config/database');
const apiRoutes = require('./routes');
const articleRoutes = require('./routes/articleRoutes');   // 原有的管理页面路由
const adminAuthRoutes = require('./routes/adminAuth');     // 新增管理认证 API

const app = express();
const PORT = 3000;

// Session 配置
app.use(session({
    secret: 'myblog_secret_key_2026',   // 请更换为复杂随机字符串
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }   // 1天有效
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- 静态页面路由 ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/post', (req, res) => res.sendFile(path.join(__dirname, 'views', 'post.html')));
app.get('/editor', (req, res) => res.sendFile(path.join(__dirname, 'views', 'editor.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin.html')));
app.get('/archive', (req, res) => res.sendFile(path.join(__dirname, 'views', 'archive.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));

// --- API 路由 ---
app.use('/api', apiRoutes);                 // 公共 API (文章、评论、资料等)
app.use('/api/admin', adminAuthRoutes);     // 管理员认证 API
app.use('/admin', articleRoutes);           // 管理页面额外路由 (如果有)

function startServer() {
    try {
        initDatabase();
        console.log('Database is ready.');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();