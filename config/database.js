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
    // --- 1. 创建文章表 ---
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

    // --- 2. 创建评论表 ---
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

    // --- 5. 新增：创建分类和标签表 ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );
    `);

    // --- 插入默认分类 (修正这里的表名) ---
    const defaultCats = ['技术', '生活', '杂谈', '默认分类'];
    // 关键点：这里必须改成 categories，不能是 category_metadata
    const checkCatStmt = db.prepare("SELECT COUNT(*) as count FROM categories WHERE name = ?");
    const insertCatStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");

    defaultCats.forEach(cat => {
        const result = checkCatStmt.get(cat);
        if (result.count === 0) {
            insertCatStmt.run(cat);
            console.log(`初始化默认分类: ${cat}`);
        }
    });

    // --- 插入默认标签 (修正这里的表名) ---
    const defaultTags = ['JavaScript', 'Node.js', 'HTML', 'CSS', 'Vue'];
    // 关键点：这里必须改成 tags，不能是 tag_metadata
    const checkTagStmt = db.prepare("SELECT COUNT(*) as count FROM tags WHERE name = ?");
    const insertTagStmt = db.prepare("INSERT INTO tags (name) VALUES (?)");

    defaultTags.forEach(tag => {
        const result = checkTagStmt.get(tag);
        if (result.count === 0) {
            insertTagStmt.run(tag);
            console.log(`初始化默认标签: ${tag}`);
        }
    });
    
    console.log('Database initialized successfully.');
}

// 导出 db 实例供 Article.js 使用，导出 initDatabase 供 app.js 使用
module.exports = { db, initDatabase };