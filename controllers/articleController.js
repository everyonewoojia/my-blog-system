// controllers/articleController.js
const Article = require('../models/Article');

exports.getHomeData = (req, res) => {
    try {
        const articles = Article.getAll();
        res.json({ success: true, data: articles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getArticleDetail = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const article = Article.getById(id);
        
        if (!article) {
            return res.status(404).json({ success: false, message: '文章不存在' });
        }

        // 增加访问量
        Article.updateViews(id);
        
        // 重新获取更新后的数据
        const updatedArticle = Article.getById(id);
        
        res.json({ success: true, data: updatedArticle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createArticle = (req, res) => {
    try {
        const { title, content, excerpt, category, tags } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: '标题和内容不能为空' });
        }
        
        const result = Article.create({ title, content, excerpt, category, tags });
        res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteArticle = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        Article.delete(id);
        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};