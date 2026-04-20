// models/Article.js
const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, '..', 'blog.db');

// 创建数据库实例
const db = new Database(DB_PATH);

// 启用外键支持
db.pragma('foreign_keys = ON');

class ArticleModel {
    /**
     * 初始化数据库表结构
     */
    static async init() {
        return new Promise((resolve, reject) => {
            try {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS articles (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        content TEXT NOT NULL,
                        excerpt TEXT DEFAULT '',
                        category TEXT DEFAULT '默认分类',
                        view_count INTEGER DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log('Database table "articles" initialized.');
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 创建新文章
     * @param {Object} data - 文章数据 { title, content, excerpt, category }
     * @returns {Promise<Object>} - 包含 lastInsertRowid 的结果对象
     */
    static async create(data) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = db.prepare(`
                    INSERT INTO articles (title, content, excerpt, category) 
                    VALUES (@title, @content, @excerpt, @category)
                `);
                
                // 使用绑定参数防止 SQL 注入
                const info = stmt.run({
                    title: data.title,
                    content: data.content,
                    excerpt: data.excerpt || '',
                    category: data.category || '默认分类'
                });

                resolve({ id: info.lastInsertRowid });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 分页查询文章列表
     * @param {number} page - 页码 (从 1 开始)
     * @param {number} limit - 每页数量
     * @param {string} category - 分类筛选 (可选)
     * @returns {Promise<Array>} - 文章列表
     */
    static async findAll(page = 1, limit = 10, category = null) {
        return new Promise((resolve, reject) => {
            try {
                const offset = (page - 1) * limit;
                let sql = `SELECT id, title, excerpt, category, view_count, created_at FROM articles`;
                const params = [];

                if (category) {
                    sql += ` WHERE category = ?`;
                    params.push(category);
                }

                sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
                params.push(limit, offset);

                const stmt = db.prepare(sql);
                const articles = stmt.all(...params);
                
                resolve(articles);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 根据 ID 获取单篇文章详情
     * @param {number} id - 文章 ID
     * @returns {Promise<Object|null>} - 文章对象
     */
    static async findById(id) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
                const article = stmt.get(id);
                resolve(article || null);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 增加文章阅读量
     * @param {number} id - 文章 ID
     * @returns {Promise<void>}
     */
    static async incrementViewCount(id) {
        return new Promise((resolve, reject) => {
            try {
                const stmt = db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?');
                stmt.run(id);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * (可选) 获取文章总数，用于前端分页计算
     */
    static async count(category = null) {
        return new Promise((resolve, reject) => {
            try {
                let sql = 'SELECT COUNT(*) as total FROM articles';
                const params = [];
                if (category) {
                    sql += ' WHERE category = ?';
                    params.push(category);
                }
                const stmt = db.prepare(sql);
                const result = stmt.get(...params);
                resolve(result.total);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = ArticleModel;