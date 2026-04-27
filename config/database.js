// config/database.js
const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, '..', 'blog.db');

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用外键支持
db.pragma('foreign_keys = ON');

// 初始化表结构
function initDatabase() {
    // 创建文章表
    // 统一字段名：为了匹配你的 Controller，这里使用 view_count 而不是 views
    db.exec(`
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            category TEXT DEFAULT '默认分类',
            tags TEXT, 
            view_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 创建评论表
    db.exec(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INTEGER NOT NULL,
            author_name TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
        )
    `);

    // --- 3. 新增：创建个人信息表 ---
    // 使用 CHECK (id = 1) 确保这是唯一的博主资料
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY CHECK (id = 1), 
            nickname TEXT DEFAULT '博主名称',
            bio TEXT DEFAULT '欢迎来到我的个人博客',
            avatar_url TEXT DEFAULT '/img/default-avatar.png',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // --- 4. 新增：初始化默认资料 ---
    const profileCount = db.prepare('SELECT COUNT(*) as count FROM user_profile').get();
    if (profileCount.count === 0) {
        db.prepare(`
            INSERT INTO user_profile (id, nickname, bio, avatar_url) 
            VALUES (1, 'Admin', '这是我的个人简介，点击编辑按钮可以修改。', '/img/default-avatar.png')
        `).run();
        console.log('✔ 已生成默认博主资料记录');
    }
    
    console.log('Database initialized successfully.');
}

// 导出 db 实例供 Article.js 使用，导出 initDatabase 供 app.js 使用
module.exports = { db, initDatabase };