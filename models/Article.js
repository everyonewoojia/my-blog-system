// models/Article.js
const { db } = require('../config/database');

class ArticleModel {
    /**
     * 获取文章列表
     * 适配 articleController.js 的调用：Article.findAll(page, limit, category)
     */
    static async findAll({ page = 1, limit = 10, category = null, keyword = null }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM articles WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM articles WHERE 1=1';
        let params = [];

        if (category) {
            query += ' AND category = ?';
            countQuery += ' AND category = ?';
            params.push(category);
        }

        if (keyword) {
            const searchPattern = `%${keyword}%`;
            query += ' AND (title LIKE ? OR content LIKE ?)';
            countQuery += ' AND (title LIKE ? OR content LIKE ?)';
            params.push(searchPattern, searchPattern);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        try {
            // --- 核心修复：针对 better-sqlite3 的写法 ---
            const stmt = db.prepare(query);
            // 合并所有参数：原本的 params + limit + offset
            const articles = stmt.all(...params, limit, offset);

            const countStmt = db.prepare(countQuery);
            const countResult = countStmt.get(...params);

            return {
                articles,
                total: countResult ? countResult.total : 0
            };
        } catch (error) {
            console.error('Database Error (findAll):', error);
            throw error;
        }
    }

    /**
     * 获取单篇文章详情
     */
    static async findById(id) {
        try {
            const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
            return stmt.get(id); // 获取单行数据
        } catch (error) {
            console.error('Database Error (findById):', error);
            throw error;
        }
    }

    /**
     * 创建新文章
     */
    static async create(data) {
        try {
            const stmt = db.prepare(`
                INSERT INTO articles (title, content, excerpt, category)
                VALUES (@title, @content, @excerpt, @category)
            `);
            const result = stmt.run({
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || '',
                category: data.category || '默认分类'
            });
            return result.lastInsertRowid; // 返回新插入的 ID
        } catch (error) {
            console.error('Database Error (create):', error);
            throw error;
        }
    }

    /**
     * 更新文章
     */
    static async update(id, data) {
        try {
            const stmt = db.prepare(`
                UPDATE articles 
                SET title = @title, 
                    content = @content, 
                    excerpt = @excerpt, 
                    category = @category,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = @id
            `);
            stmt.run({
                id,
                title: data.title,
                content: data.content,
                excerpt: data.excerpt,
                category: data.category
            });
            return true;
        } catch (error) {
            console.error('Database Error (update):', error);
            throw error;
        }
    }

    /**
     * 阅读量自增
     */
    static async incrementViewCount(id) {
        try {
            const stmt = db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?');
            stmt.run(id);
        } catch (error) {
            console.error('Database Error (incrementViewCount):', error);
        }
    }

    /**
     * 删除文章
     */
    static async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
            stmt.run(id);
            return true;
        } catch (error) {
            console.error('Database Error (delete):', error);
            throw error;
        }
    }

    /**
     * 获取各分类的文章数量统计
     */
    static async getCategoryStats() {
        try {
            // 统计每个分类下的文章数量
            const stmt = db.prepare(`
                SELECT category, COUNT(*) as count 
                FROM articles 
                GROUP BY category
            `);
            return stmt.all();
        } catch (error) {
            console.error('Database Error (getCategoryStats):', error);
            throw error;
        }
    }
}

module.exports = ArticleModel;