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

    // --- 5. 新增：初始化默认标签 ---
    // 逻辑 A：为没有标签的存量文章增加默认标签
    // 这能解决首页因标签字段为 NULL 导致无法正常加载或过滤的问题
    const articlesWithoutTags = db.prepare("SELECT COUNT(*) as count FROM articles WHERE tags IS NULL OR tags = ''").get();
    if (articlesWithoutTags.count > 0) {
        console.log('正在为无标签文章设置默认标签...');
        db.prepare("UPDATE articles SET tags = '日常,未分类' WHERE tags IS NULL OR tags = ''").run();
    }

    // 逻辑 B (可选进阶)：创建一个标签元数据表，用于存储“常用标签”
    // 这样在编辑界面可以展示“推荐标签”给用户选择
    db.exec(`
        CREATE TABLE IF NOT EXISTS tag_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    `);

    const defaultTags = ['JavaScript', 'CSS', 'Vue', 'Node.js', 'HTML', '技术分享'];
    const checkTagStmt = db.prepare("SELECT COUNT(*) as count FROM tag_metadata WHERE name = ?");
    const insertTagStmt = db.prepare("INSERT INTO tag_metadata (name) VALUES (?)");

    defaultTags.forEach(tag => {
        const result = checkTagStmt.get(tag);
        if (result.count === 0) {
            insertTagStmt.run(tag);
            console.log(`添加默认推荐标签: ${tag}`);
        }
    });

    // --- 6. 新增：确保已有标签元数据表，并新增分类元数据表 ---
    db.exec(`
        CREATE TABLE IF NOT EXISTS tag_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS category_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );
    `);

    const defaultCats = ['技术', '生活', '杂谈', '默认分类'];
    const insertCatStmt = db.prepare("INSERT OR IGNORE INTO category_metadata (name) VALUES (?)");
    defaultCats.forEach(cat => insertCatStmt.run(cat));
    
    console.log('Database initialized successfully.');
}

// 导出 db 实例供 Article.js 使用，导出 initDatabase 供 app.js 使用
module.exports = { db, initDatabase };