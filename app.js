// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const ArticleModel = require('./models/Article'); // 1. 引入第3-4学时创建的文章模型
const apiRoutes = require('./routes');           // 引入 API 路由

const app = express();
const PORT = process.env.PORT || 3000;

// --- 2. 中间件配置 ---
app.use(cors());
app.use(express.json()); // 解析 JSON 请求体，用于处理发布文章的 POST 请求

// 托管静态文件 (CSS, JS, Images)
// 确保你的 style.css 和 script.js 放在项目根目录下的 public 文件夹中
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. 路由配置 ---

// API 接口路由
app.use('/api', apiRoutes);

// 前端页面路由（直接发送 HTML 文件）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'post.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'editor.html'));
});

// --- 4. 异步启动逻辑 ---
/**
 * 启动应用：先初始化数据库，成功后再监听端口
 */
async function startServer() {
    try {
        console.log('正在初始化数据库...');
        
        // 调用模型中的 init 方法，确保 sqlite 数据库文件和 Article 表已创建
        await ArticleModel.init();
        
        console.log('数据库已就绪 (Database is ready).');

        // 启动 Express 服务器
        app.listen(PORT, () => {
            console.log(`================================================`);
            console.log(`   服务器运行成功！`);
            console.log(`   本地访问地址: http://localhost:${PORT}`);
            console.log(`================================================`);
        });
    } catch (error) {
        console.error('服务器启动失败 (Failed to start server):', error);
        // 如果数据库初始化失败，则强行退出进程，避免带病运行
        process.exit(1);
    }
}

// 执行启动函数
startServer();