// models/Comment.js
const { db } = require('../config/database');

class Comment {
    static getByArticleId(articleId) {
        return db.prepare('SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC').all(articleId);
    }

    static create({ article_id, author_name, content }) {
        const stmt = db.prepare(`
            INSERT INTO comments (article_id, author_name, content) 
            VALUES (?, ?, ?)
        `);
        return stmt.run(article_id, author_name, content);
    }
}

module.exports = Comment;