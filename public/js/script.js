// public/js/script.js (示例改造)

// 1. 首页加载文章
async function loadArticles() {
    const articleListContainer = document.getElementById('article-list');
    if (!articleListContainer) return;

    try {
        const response = await fetch('/api/articles');
        const result = await response.json();
        
        if (result.success) {
            const articles = result.data;
            articleListContainer.innerHTML = articles.map(article => `
                <article class="article-card">
                    <div class="article-meta">
                        <span>${new Date(article.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>${article.category}</span>
                    </div>
                    <h2 class="article-title">
                        <a href="/post?id=${article.id}">${article.title}</a>
                    </h2>
                    <p class="article-excerpt">${article.excerpt || article.content.substring(0, 100) + '...'}</p>
                    <a href="/post?id=${article.id}" class="read-more-btn">阅读更多</a>
                </article>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load articles:', error);
    }
}

// 2. 详情页加载文章和评论
async function loadPostDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return;

    // 加载文章内容
    try {
        const res = await fetch(`/api/articles/${id}`);
        const result = await res.json();
        if (result.success) {
            const article = result.data;
            document.querySelector('.post-title').textContent = article.title;
            document.querySelector('.post-content').innerHTML = parseMarkdown(article.content); // 复用之前的 markdown 解析
            // 更新作者、日期等...
        }
    } catch (e) { console.error(e); }

    // 加载评论
    loadComments(id);
}

async function loadComments(articleId) {
    try {
        const res = await fetch(`/api/comments/${articleId}`);
        const result = await res.json();
        if (result.success) {
            const list = document.getElementById('comment-list');
            list.innerHTML = result.data.map(c => `
                <div class="comment-item">
                     <div class="comment-body">
                        <div class="comment-header">
                            <span class="comment-author">${c.author_name}</span>
                            <span class="comment-date">${new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p class="comment-text">${c.content}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) { console.error(e); }
}

// 3. 提交评论
async function submitComment(articleId, name, content) {
    try {
        const res = await fetch(`/api/comments/${articleId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author_name: name, content })
        });
        const result = await res.json();
        if (result.success) {
            alert('评论成功');
            loadComments(articleId); // 刷新评论列表
        } else {
            alert(result.message);
        }
    } catch (e) { console.error(e); }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    loadPostDetail();
    
    // 绑定评论表单提交事件 (需要在 post.html 中确保表单 ID 正确)
    const form = document.getElementById('comment-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            const name = document.getElementById('comment-name').value;
            const content = document.getElementById('comment-content').value;
            submitComment(id, name, content);
        });
    }
    
    // 深色模式逻辑保持不变...
    initThemeToggle();
});

// ... 保留 initThemeToggle 和 parseMarkdown 函数

// 4. 简易 Markdown 解析器 (仅用于演示预览效果)
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

// 5. 编辑器实时预览逻辑
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
    loadArticles()
    initEditor();
});

// script.js - 追加部分

// 主题切换逻辑
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    if (!toggleBtn) return; // 如果页面没有按钮则退出

    // 1. 检查本地存储或系统偏好
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        enableDarkMode();
    } else {
        enableLightMode();
    }

    // 2. 绑定点击事件
    toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
    });

    // 辅助函数：启用深色模式
    function enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    }

    // 辅助函数：启用浅色模式
    function enableLightMode() {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
}

// 在 DOMContentLoaded 中调用
document.addEventListener('DOMContentLoaded', () => {
    initEditor();
    initThemeToggle(); // 初始化主题切换
    // 只有在包含文章列表容器的页面（首页）才执行
    if (document.getElementById('article-list')) {
        console.log('检测到首页，开始加载文章...');
        loadArticles(); 
    }
});