// app.js 完整代码片段
const express = require('express');
const path = require('path');
const { initDatabase } = require('./config/database'); 
const apiRoutes = require('./routes');   
const articleRoutes = require('./routes/articleRoutes');       

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- 路由配置 ---

// 1. 静态页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'post.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'editor.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));

// 2. API 接口路由
app.use('/api', apiRoutes);

// 3. 管理后台页面路由 (修改挂载点为 /admin，对应你报错的路径前缀)
app.use('/admin', articleRoutes); 

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