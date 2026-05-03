// models/Article.js
const { db } = require('../config/database');

class ArticleModel {
    /**
     * 获取文章列表
     * 适配 articleController.js 的调用：Article.findAll(page, limit, category)
     */
    static async findAll({ page = 1, limit = 10, category = null, keyword = null, tag = null } = {}) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM articles WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM articles WHERE 1=1';
        let params = [];

        if (category) {
            query += ' AND category = ?';
            countQuery += ' AND category = ?';
            params.push(category);
        }

        if (tag) {
            query += ' AND tags LIKE ?';
            countQuery += ' AND tags LIKE ?';
            params.push(`%${tag}%`);
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
            return article;
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
            // 1. 插入文章
            const stmt = db.prepare(`
                INSERT INTO articles (title, content, excerpt, category, tags) 
                VALUES (@title, @content, @excerpt, @category, @tags)
            `);
            const result = stmt.run({
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || '',
                category: data.category || '默认分类',
                tags: data.tags || ''
            });

            // 2. 永久保存标签到元数据表 (Sync Metadata)
            if (data.tags) {
                const tagList = data.tags.split(',').map(t => t.trim()).filter(t => t);
                const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
                tagList.forEach(tag => insertTag.run(tag));
            }

            return result.lastInsertRowid;
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
                SET title = @title, content = @content, excerpt = @excerpt, 
                    category = @category, tags = @tags, updated_at = CURRENT_TIMESTAMP
                WHERE id = @id
            `);
            stmt.run({ id, ...data });
            // 同步元数据
            this.syncMetadata(data.category, data.tags);
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
            // 1. 首先删除该文章下的所有评论
            const deleteCommentsSql = `DELETE FROM comments WHERE article_id = ?`;
            db.prepare(deleteCommentsSql).run(id);

            // 2. 然后删除文章
            const deleteArticleSql = `DELETE FROM articles WHERE id = ?`;
            return db.prepare(deleteArticleSql).run(id);
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

    /**
     * 获取所有不重复的标签及其计数
     */
    static async getTagStats() {
        try {
            const allTagsRow = db.prepare('SELECT tags FROM articles WHERE tags IS NOT NULL').all();
            const tagMap = {};
            
            allTagsRow.forEach(row => {
                if (row.tags) {
                    row.tags.split(',').forEach(t => {
                        const tag = t.trim();
                        if (tag) tagMap[tag] = (tagMap[tag] || 0) + 1;
                    });
                }
            });

            return Object.keys(tagMap).map(name => ({ name, count: tagMap[name] }));
        } catch (error) {
            console.error('Get Tag Stats Error:', error);
            return [];
        }
    }

    /**
     * 获取所有元数据（分类和标签列表）
     */
    static async getAllMetadata() {
        // 1. 修改表名为 categories 和 tags
        const categories = db.prepare('SELECT name FROM categories ORDER BY name ASC').all();
        const tags = db.prepare('SELECT name FROM tags ORDER BY name ASC').all();
        return {
            categories: categories.map(c => c.name),
            tags: tags.map(t => t.name)
        };
    }

    /**
     * 私有辅助方法：维护元数据表
     * 当新文章使用了不存在的分类或标签时，自动记录
     */
    static syncMetadata(category, tagsString) {
        if (category) {
            // 2. 修改表名为 categories
            db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run(category);
        }
        if (tagsString) {
            const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
            // 3. 修改表名为 tags
            const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
            tags.forEach(tag => insertTag.run(tag));
        }
    }

    /**
     * 获取文章归档列表
     */
    static async getArchive() {
        // 按时间从晚到早（倒序）排序
        return db.prepare('SELECT id, title, created_at FROM articles ORDER BY created_at DESC').all();
    }
}

module.exports = ArticleModel;