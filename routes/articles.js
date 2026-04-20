// routes/articles.js
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

router.get('/', articleController.getHomeData);       // GET /api/articles
router.get('/:id', articleController.getArticleDetail); // GET /api/articles/1
router.post('/', articleController.createArticle);      // POST /api/articles
router.delete('/:id', articleController.deleteArticle); // DELETE /api/articles/1

module.exports = router;