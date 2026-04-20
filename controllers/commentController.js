// controllers/commentController.js
const Comment = require('../models/Comment');

exports.getComments = (req, res) => {
    try {
        const articleId = parseInt(req.params.articleId);
        const comments = Comment.getByArticleId(articleId);
        res.json({ success: true, data: comments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addComment = (req, res) => {
    try {
        const articleId = parseInt(req.params.articleId);
        const { author_name, content } = req.body;
        
        if (!author_name || !content) {
            return res.status(400).json({ success: false, message: '昵称和内容不能为空' });
        }

        Comment.create({ article_id: articleId, author_name, content });
        res.status(201).json({ success: true, message: '评论发表成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};