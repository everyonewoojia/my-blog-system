// models/Article.js
const { db } = require('../config/database');

class Article {
    static getAll() {
        return db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
    }

    static getById(id) {
        return db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    }

    static create({ title, content, excerpt, category, tags }) {
        const stmt = db.prepare(`
            INSERT INTO articles (title, content, excerpt, category, tags) 
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(title, content, excerpt || '', category || '未分类', tags || '');
    }

    static updateViews(id) {
        return db.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').run(id);
    }
    
    static delete(id) {
        return db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    }
}

module.exports = Article;