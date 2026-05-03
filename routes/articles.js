// routes/articles.js
const express = require('express');
const router = express.Router();
// 确保这里的路径指向你刚才修改的那个 controller 文件
const articleController = require('../controllers/articleController');

// --- 新增：获取分类统计信息 ---
router.get('/stats', articleController.getStats);
router.get('/tag-stats', articleController.getTagStats);
router.get('/metadata', articleController.getMetadata);
// 获取文章归档
router.get('/archive', articleController.getArchive);

// --- 新增：持久化保存分类和标签 ---
// 对应前端 fetch('/api/articles/categories', ...)
router.post('/categories', articleController.addCategory); 
// 对应前端 fetch('/api/articles/tags', ...)
router.post('/tags', articleController.addTag);

// --- 路由配置：必须确保第二个参数在 articleController 中真实存在 ---

// 1. 获取文章列表 (之前报错的第 6 行)
router.get('/', articleController.getArticles);

// 2. 获取单篇文章详情 (现在报错的第 7 行)
// 注意：必须使用 getArticleById，因为 controller 里是这个名字
router.get('/:id', articleController.getArticleById);

// 3. 创建文章
router.post('/', articleController.createArticle);

// 4. 更新文章
router.put('/:id', articleController.updateArticle);

// 5. 删除文章
router.delete('/:id', articleController.deleteArticle);

module.exports = router;