// controllers/articleController.js
const Article = require('../models/Article');

/**
 * 辅助函数：生成文章摘要
 * 去除 Markdown 符号，取前 150 个字符
 */
function generateExcerpt(content, length = 150) {
    if (!content) return '';
    
    // 简单的 Markdown 清理：移除 #, *, -, >, [], () 等常见符号
    const plainText = content
        .replace(/#{1,6}\s/g, '')       // 移除标题标记
        .replace(/[*_~`]/g, '')         // 移除强调和代码标记
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 保留链接文字
        .replace(/^>\s/gm, '')          // 移除引用标记
        .replace(/-{3,}/g, '')          // 移除分割线
        .trim();

    if (plainText.length <= length) {
        return plainText;
    }
    return plainText.substring(0, length) + '...';
}

const articleController = {
    /**
     * 获取文章列表 (支持分页和分类筛选)
     * GET /api/articles?page=1&limit=10&category=Tech
     */
    getArticles: async (req, res) => {
        try {
            const { page = 1, limit = 10, category, keyword, tag } = req.query; // 确保提取了 keyword

            // 调用 Model 层，将 keyword 传入
            const { articles, total } = await Article.findAll({ 
                page: parseInt(page), 
                limit: parseInt(limit), 
                category,
                keyword,
                tag 
            });

            res.json({ success: true, data: articles, total });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * 获取单篇文章详情
     * GET /api/articles/:id
     */
    getArticleById: async (req, res) => {
        try {
            const { id } = req.params;
            const article = await Article.findById(id);
            
            if (!article) {
                return res.status(404).json({ success: false, message: '文章不存在' });
            }

            // 阅读量自增
            await Article.incrementViewCount(id);

            res.json({ success: true, data: article });
        } catch (error) {
            console.error('获取文章详情失败:', error);
            res.status(500).json({ success: false, message: '服务器内部错误' });
        }
    },

    /**
     * 创建新文章
     * POST /api/articles
     */
    createArticle: async (req, res) => {
        try {
            const { title, content, category, tags } = req.body;
            const excerpt = generateExcerpt(content);

            if (!title || !content) {
                return res.status(400).json({ success: false, message: '标题和内容不能为空' });
            }

            const articleData = {
                title,
                content,
                excerpt: generateExcerpt(content), // 自动生成摘要
                category: category || '默认分类',
                tags: tags || [],
                excerpt
            };

            const newId = await Article.create(articleData);
            res.status(201).json({
                success: true,
                message: '文章发布成功',
                data: { id: newId }
            });
        } catch (error) {
            console.error('发布文章失败:', error);
            res.status(500).json({ success: false, message: '服务器内部错误' });
        }
    },

    /**
     * 更新文章
     * PUT /api/articles/:id
     */
    updateArticle: async (req, res) => {
        try {
            const id = req.params.id;
            const { title, content, category, tags } = req.body;

            const updateData = { id, title, content, category, tags };
            updateData.excerpt = generateExcerpt(content);

            await Article.update(id, updateData);

            res.json({
                success: true,
                message: '文章更新成功'
            });
        } catch (error) {
            console.error('更新文章失败:', error);
            res.status(500).json({ success: false, message: '服务器内部错误' });
        }
    },

    /**
     * 删除文章
     * DELETE /api/articles/:id
     */
    deleteArticle: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const existingArticle = await Article.findById(id);
            
            if (!existingArticle) {
                return res.status(404).json({ success: false, message: '文章不存在' });
            }

            await Article.delete(id);

            res.json({
                success: true,
                message: '文章删除成功'
            });
        } catch (error) {
            console.error('删除文章失败:', error);
            res.status(500).json({ success: false, message: '服务器内部错误' });
        }
    },

    /**
     * 获取分类统计信息
     * GET /api/articles/stats
     */
    getStats: async (req, res) => {
        try {
            const stats = await Article.getCategoryStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * 获取标签统计信息
     * GET /api/articles/tag-stats
     */
    getTagStats: async (req, res) => {
        try {
            const stats = await Article.getTagStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    },

    /**
     * 获取编辑器所需的分类和标签种子数据
     * GET /api/articles/metadata
     */
    getMetadata: async (req, res) => {
        try {
            // 1. 获取分类：从文章表提取已有的
            const categories = await Article.getCategoryStats();
            // 2. 获取标签：调用已有的 getTagStats
            const tags = await Article.getTagStats();
            
            res.json({ 
                success: true, 
                data: {
                    categories: categories.map(c => c.category),
                    tags: tags.map(t => t.name)
                }
            });
        } catch (error) {
            res.status(500).json({ success: true, categories: ['技术', '生活'], tags: [] });
        }
    }
};

// --- 关键：必须导出该对象，否则路由文件无法调用其内部函数 ---
module.exports = articleController;