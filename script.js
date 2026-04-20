// script.js

// 1. 模拟文章数据
const articles = [
    {
        id: 1,
        title: "探索现代前端开发趋势",
        date: "2023-10-25",
        category: "前端技术",
        excerpt: "随着 React、Vue 等框架的演进，前端开发模式发生了巨大变化。本文将探讨组件化、状态管理以及服务端渲染的最新实践...",
        content: "# 探索现代前端开发趋势\n\n随着 Web 技术的发展..."
    },
    {
        id: 2,
        title: "CSS Grid 布局完全指南",
        date: "2023-10-20",
        category: "CSS",
        excerpt: "Grid 布局是 CSS 中最强大的布局系统。它是一个二维系统，这意味着它可以同时处理行和列，这与 Flexbox 主要是一维系统不同...",
        content: "# CSS Grid 布局\n\nGrid 布局允许我们..."
    },
    {
        id: 3,
        title: "如何构建高性能的个人博客",
        date: "2023-10-15",
        category: "全栈开发",
        excerpt: "性能优化是用户体验的关键。从图片懒加载到代码分割，每一个细节都影响着页面的加载速度...",
        content: "# 性能优化\n\n关键点包括..."
    }
];

// 2. 首页文章渲染逻辑
function renderArticles() {
    const articleListContainer = document.getElementById('article-list');
    if (!articleListContainer) return; // 如果不是首页，直接返回

    articleListContainer.innerHTML = articles.map(article => `
        <article class="article-card">
            <div class="article-meta">
                <span>${article.date}</span>
                <span>•</span>
                <span>${article.category}</span>
            </div>
            <h2 class="article-title">
                <a href="post.html">${article.title}</a>
            </h2>
            <p class="article-excerpt">${article.excerpt}</p>
            <a href="post.html" class="read-more-btn">阅读更多</a>
        </article>
    `).join('');
}

// 3. 简易 Markdown 解析器 (仅用于演示预览效果)
function parseMarkdown(markdown) {
    let html = markdown
        // 标题
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        // 粗体
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        // 斜体
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        // 代码块
        .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
        // 行内代码
        .replace(/`(.*?)`/gim, '<code>$1</code>')
        // 换行
        .replace(/\n/gim, '<br>');
    
    return html;
}

// 4. 编辑器实时预览逻辑
function initEditor() {
    const input = document.getElementById('markdown-input');
    const output = document.getElementById('preview-output');
    
    if (!input || !output) return; // 如果不是编辑页，直接返回

    input.addEventListener('input', () => {
        const markdownText = input.value;
        output.innerHTML = parseMarkdown(markdownText);
    });

    // 初始化默认文本
    input.value = "# 欢迎使用 Markdown 编辑器\n\n在这里输入内容，右侧将**实时预览**。\n\n- 支持标题\n- 支持列表\n- 支持 `代码`";
    output.innerHTML = parseMarkdown(input.value);
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    renderArticles();
    initEditor();
});