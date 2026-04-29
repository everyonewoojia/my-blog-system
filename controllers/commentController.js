// controllers/commentController.js
const Comment = require('../models/Comment');

/**
 * 添加评论
 */
exports.addComment = (req, res) => {
    try {
        const { author_name, content } = req.body;
        const article_id = req.params.articleId; // 从路由参数获取文章ID

        if (!author_name || !content) {
            return res.status(400).json({ error: '昵称和内容不能为空' });
        }

        Comment.create({ article_id, author_name, content });
        res.json({ message: '评论发表成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '服务器错误：无法保存评论' });
    }
};

/**
 * 获取文章的评论
 */
exports.getComments = (req, res) => {
    try {
        const articleId = req.params.articleId;
        // 使用你更正后的方法名 getByArticleId
        const comments = Comment.getByArticleId(articleId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: '无法获取评论' });
    }
};

/**
 * 获取所有评论
 */
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.getAllCommentsWithTitle();
        res.json({ success: true, data: comments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 删除评论
 */
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        // 调用模型层的删除方法
        const result = await Comment.delete(id); 
        
        // result.changes 是 better-sqlite3 返回的受影响行数
        if (result && result.changes > 0) {
            res.json({ 
                success: true, 
                message: '评论已删除' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: '数据库中未找到该评论' 
            });
        }
    } catch (error) {
        console.error("后端删除报错:", error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
};