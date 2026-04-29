// models/Comment.js
const { db } = require('../config/database');

class Comment {
    /**
     * 创建一条新评论
     * @param {Object} data - 包含 article_id, author_name, content
     */
    static create({ article_id, author_name, content }) {
        const stmt = db.prepare(`
            INSERT INTO comments (article_id, author_name, content) 
            VALUES (?, ?, ?)
        `);
        return stmt.run(article_id, author_name, content);
    }

    /**
     * 根据文章 ID 获取该文章下的所有评论
     * @param {number} articleId 
     */
    static getByArticleId(articleId) {
        return db.prepare('SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC').all(articleId);
    }
    /**
     * 获取所有评论（用于后台管理）
     */
    static async getAllCommentsWithTitle() {
        const sql = `
            SELECT 
                comments.*, 
                articles.title AS article_title 
            FROM comments 
            LEFT JOIN articles ON comments.article_id = articles.id 
            ORDER BY comments.created_at DESC
        `;
        
        try {
            // 直接调用 db.prepare，因为 db 现在是对象
            return db.prepare(sql).all();
        } catch (error) {
            console.error("SQL执行失败:", error.message);
            throw error;
        }
    }

    /**
     * 删除一条评论
     * @param {number} id - 评论的 ID
     */
    static delete(id) {
        const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
        return stmt.run(id);
    }
}

module.exports = Comment;