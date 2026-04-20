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
    db.exec(`
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            category TEXT DEFAULT '未分类',
            tags TEXT, -- 存储为逗号分隔字符串，简单起见
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            views INTEGER DEFAULT 0
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
    
    console.log('Database initialized successfully.');
}

module.exports = { db, initDatabase };