// routes/comments.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// --- 前台接口 ---

// 获取特定文章的评论：GET /api/comments/:articleId
router.get('/:articleId', commentController.getComments);

// 提交特定文章的评论：POST /api/comments/:articleId
router.post('/:articleId', commentController.addComment);

// --- 后台管理接口 ---

// 获取系统所有评论：GET /api/comments/admin/all
// 注意：为了不与 :articleId 冲突，我们加一个 admin 路径
router.get('/admin/all', commentController.getAllComments);

// 删除评论：DELETE /api/comments/:id
router.delete('/:id', commentController.deleteComment);

module.exports = router;