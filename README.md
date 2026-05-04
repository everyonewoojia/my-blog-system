# 📝 Blog Prototype

一个功能完整的个人博客系统，基于 **Node.js + Express + SQLite** 构建，支持文章管理、评论互动、管理员登录、深色模式及响应式布局。附带完整的单元测试，核心模块覆盖率 > 80%。

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite)
![Jest](https://img.shields.io/badge/Jest-29+-C21325?style=flat&logo=jest)

---

## ✨ 功能特性

- **文章管理**：支持 Markdown 编辑与实时预览，文章分类、标签筛选，阅读量统计
- **评论系统**：匿名评论，后台评论审核（删除）
- **管理员后台**：基于 Session 的登录认证，可在线修改管理员凭据（bcrypt 加密）
- **深色模式**：自动/手动切换，数据持久化到 localStorage
- **响应式设计**：适配桌面端与移动端，侧边栏粘性定位，文章卡片双列布局
- **归档页面**：时间线风格展示，按年份分组
- **关于页面**：可编辑的个人资料（昵称、简介、头像）
- **单元测试**：67 个测试用例全部通过，覆盖 Models 和 Controllers 核心逻辑

---

## 🛠 技术栈

- **后端**：Node.js, Express, express-session, bcryptjs, better-sqlite3
- **前端**：原生 HTML/CSS/JS, Font Awesome 图标, Marked (Markdown 解析)
- **测试**：Jest, 内存数据库模拟
- **数据库**：SQLite (文件存储)

---

## 📦 安装与运行

### 前提条件

- Node.js 18 及以上版本
- npm 或 yarn

### 克隆仓库并安装依赖

```bash
git clone <https://github.com/everyonewoojia/my-blog-system.git>
cd blog-prototype
npm install
```

### 启动应用

```bash
npm start
```

服务默认运行在 `http://localhost:3000`。

**默认管理员账户**  
用户名：`admin`  
密码：`admin123`  
首次启动后请及时在后台管理界面修改凭据。

### 运行测试

```bash
npm test
```

测试使用内存数据库，不会影响真实数据。测试报告将输出覆盖率和详细结果。

---

## 📁 项目结构

```
blog-prototype/
├── config/
│   └── database.js         # 数据库初始化与连接
├── controllers/
│   ├── articleController.js
│   ├── commentController.js
│   └── userController.js
├── models/
│   ├── Article.js
│   ├── Comment.js
│   └── User.js
├── routes/
│   ├── adminAuth.js         # 管理员认证路由
│   ├── articleRoutes.js     # 管理页面静态路由
│   ├── articles.js          # 文章 API 路由
│   ├── comments.js          # 评论 API 路由
│   └── index.js             # 路由汇总
├── views/
│   ├── index.html            # 首页
│   ├── post.html             # 文章详情
│   ├── editor.html           # 文章编辑器
│   ├── admin.html            # 管理后台
│   ├── archive.html          # 归档页面
│   └── about.html            # 关于我
├── public/
│   ├── css/
│   │   └── style.css         # 全局样式
│   ├── js/
│   │   └── script.js         # 主题切换等公共脚本
│   └── img/                  # 图片资源
├── tests/
│   ├── controllers/
│   │   ├── articleController.test.js
│   │   ├── commentController.test.js
│   │   └── userController.test.js
│   └── models/
│       ├── Article.test.js
│       ├── Comment.test.js
│       └── User.test.js
├── app.js                    # 应用入口
├── package.json
├── jest.config.js
└── blog.db                   # SQLite 数据库文件（自动生成）
```

---

## ⚙️ 配置说明

- **数据库切换**：当 `NODE_ENV=test` 时，数据库使用内存模式，避免污染真实数据；生产环境默认使用 `blog.db` 文件。
- **Session 密钥**：在 `app.js` 中修改 `secret` 字段以提高安全性。
- **自定义样式**：CSS 变量定义于 `style.css` 的 `:root` 和 `[data-theme="dark"]` 中，可快速调整主题配色。

---

## 🧪 测试详情

- 框架：Jest
- 测试策略：对 Models 层使用真实内存数据库进行 SQL 验证；对 Controllers 层 Mock 模型方法，验证请求/响应处理。
- 覆盖率阈值：全局 statements ≥ 80%, branches ≥ 80%, functions ≥ 80%, lines ≥ 80% （已达成）
- 运行命令：`npm test` 或 `npm test -- --coverage` 查看详细报告

---

## 📄 License

本项目仅用于个人学习与演示目的。
