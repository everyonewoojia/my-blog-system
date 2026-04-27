// routes/index.js
const express = require('express');
const router = express.Router();
const articleRoutes = require('./articles');
const commentRoutes = require('./comments');
const userController = require('../controllers/userController');

router.use('/articles', articleRoutes);
router.use('/comments', commentRoutes);

// 个人资料相关接口
router.get('/profile', userController.getProfile);
router.post('/profile', userController.updateProfile);

module.exports = router;