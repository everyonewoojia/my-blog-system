// routes/comments.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/:articleId', commentController.getComments);   // GET /api/comments/1
router.post('/:articleId', commentController.addComment);   // POST /api/comments/1

module.exports = router;