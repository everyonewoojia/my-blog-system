// config/database.js
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');   // 用于初始化默认密码

// 数据库文件路径
const DB_PATH = path.join(__dirname, '..', 'blog.db');

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用外键支持
db.pragma('foreign_keys = ON');

// 初始化表结构
function initDatabase() {
    // --- 1. 创建文章表 ---
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

    // --- 3. 创建个人信息表 ---
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

    // 兼容旧数据库：尝试添加 username, password 列
    try { db.exec(`ALTER TABLE user_profile ADD COLUMN username TEXT DEFAULT 'admin'`); } catch(e) {}
    try { db.exec(`ALTER TABLE user_profile ADD COLUMN password TEXT`); } catch(e) {}

    // 确保有一条 id=1 的记录并有默认凭据
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    if (!profile) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.prepare(`
            INSERT INTO user_profile (id, nickname, bio, avatar_url, username, password)
            VALUES (1, 'Admin', '这是我的个人简介，点击编辑按钮可以修改。', '/img/default-avatar.png', 'admin', ?)
        `).run(hashedPassword);
        console.log('✔ 已生成默认管理员账户 admin/admin123');
    } else {
        // 如果已有记录但缺少凭据，则补上默认值
        if (!profile.username) {
            db.prepare(`UPDATE user_profile SET username = 'admin' WHERE id = 1`).run();
        }
        if (!profile.password) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.prepare(`UPDATE user_profile SET password = ? WHERE id = 1`).run(hashedPassword);
        }
    }

    // --- 4. 创建分类和标签表 ---
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

    // 添加默认分类和标签
    const defaultCats = ['技术', '生活', '杂谈', '默认分类'];
    const checkCatStmt = db.prepare("SELECT COUNT(*) as count FROM categories WHERE name = ?");
    const insertCatStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
    defaultCats.forEach(cat => {
        if (checkCatStmt.get(cat).count === 0) insertCatStmt.run(cat);
    });

    const defaultTags = ['JavaScript', 'Node.js', 'HTML', 'CSS', 'Vue'];
    const checkTagStmt = db.prepare("SELECT COUNT(*) as count FROM tags WHERE name = ?");
    const insertTagStmt = db.prepare("INSERT INTO tags (name) VALUES (?)");
    defaultTags.forEach(tag => {
        if (checkTagStmt.get(tag).count === 0) insertTagStmt.run(tag);
    });
    
    console.log('Database initialized successfully.');
}

// 导出 db 实例供 Article.js 使用，导出 initDatabase 供 app.js 使用
module.exports = { db, initDatabase };