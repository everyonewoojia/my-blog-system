// public/js/script.js

/**
 * 全局深色模式初始化与切换逻辑
 */
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    if (!toggleBtn) return;

    const enableDarkMode = () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (moonIcon) moonIcon.style.display = 'none';
        if (sunIcon) sunIcon.style.display = 'block';
    };

    const enableLightMode = () => {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (moonIcon) moonIcon.style.display = 'block';
        if (sunIcon) sunIcon.style.display = 'none';
    };

    // 初始化应用
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        enableDarkMode();
    } else {
        enableLightMode();
    }

    // 绑定点击事件
    toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        isDark ? enableLightMode() : enableDarkMode();
    });
}

// 页面加载完成后统一启动全局功能
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});