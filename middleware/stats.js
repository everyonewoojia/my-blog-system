// middleware/stats.js
const Article = require('../models/Article');

// 简单的页面访问统计中间件
// 注意：这只是一个基础示例，实际生产中可能需要更复杂的逻辑（如去重 IP）
function trackArticleViews(req, res, next) {
    // 假设路由是 /api/articles/:id/view 或者在获取详情时自动触发
    // 这里我们做一个通用的拦截，如果 URL 包含 /articles/数字，则增加计数
    // 更好的做法是在 Controller 的 getDetail 中调用
    
    next();
}

module.exports = { trackArticleViews };