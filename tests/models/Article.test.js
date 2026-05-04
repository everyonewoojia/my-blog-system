const { db, initDatabase } = require('../../config/database');
const Article = require('../../models/Article');

beforeAll(() => { initDatabase(); });
beforeEach(() => {
    db.exec('DELETE FROM articles; DELETE FROM comments; DELETE FROM user_profile; DELETE FROM categories; DELETE FROM tags;');
    // 重新插入必要的默认分类和标签，防止外键约束
    ['技术','生活','杂谈','默认分类'].forEach(c => db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run(c));
    ['JavaScript','Node.js','HTML','CSS','Vue'].forEach(t => db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(t));
});

describe('Article Model', () => {
    describe('create', () => {
        test('should create a new article and return id', async () => {
            const id = await Article.create({
                title: 'Test Title',
                content: 'Hello World',
                category: '技术',
                tags: 'Node.js, Testing'
            });
            expect(id).toBeGreaterThan(0);
            const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
            expect(article.title).toBe('Test Title');
        });
    });

    describe('findAll', () => {
        beforeEach(async () => {
            await Article.create({ title: 'A', content: 'a', category: '生活', tags: 'HTML' });
            await Article.create({ title: 'B', content: 'b', category: '技术', tags: 'CSS' });
        });
        test('should return all articles with default pagination', async () => {
            const { articles, total } = await Article.findAll();
            expect(articles.length).toBe(2);
            expect(total).toBe(2);
        });
        test('should filter by category', async () => {
            const { articles } = await Article.findAll({ category: '技术' });
            expect(articles.length).toBe(1);
            expect(articles[0].title).toBe('B');
        });
        test('should filter by keyword', async () => {
            const { articles } = await Article.findAll({ keyword: 'b' });
            expect(articles.length).toBe(1);
        });
        test('should filter by tag', async () => {
            const { articles } = await Article.findAll({ tag: 'HTML' });
            expect(articles.length).toBe(1);
        });
        test('should handle pagination (page 2)', async () => {
            // 创建更多文章
            for(let i=0; i<12; i++) await Article.create({ title: `T${i}`, content: 'x' });
            const { articles, total } = await Article.findAll({ page: 2, limit: 2 });
            expect(articles.length).toBe(2);
            expect(total).toBe(14); // 2+12
        });
    });

    describe('findById', () => {
        let id;
        beforeEach(async () => {
            id = await Article.create({ title: 'Single', content: 'alone' });
        });
        test('should return article by id', async () => {
            const article = await Article.findById(id);
            expect(article.title).toBe('Single');
        });
        test('should return undefined for non-existent id', async () => {
            const article = await Article.findById(999);
            expect(article).toBeUndefined();
        });
    });

    describe('update', () => {
        let id;
        beforeEach(async () => {
            id = await Article.create({ title: 'Old', content: 'old' });
        });
        test('should update article fields', async () => {
            await Article.update(id, { 
                title: 'New', content: 'new', excerpt: 'new', 
                category: '杂谈', tags: 'php' 
            });
            const article = await Article.findById(id);
            expect(article.title).toBe('New');
            expect(article.category).toBe('杂谈');
        });
    });

    describe('delete', () => {
        let id;
        beforeEach(async () => { id = await Article.create({ title: 'Del', content: 'x' }); });
        test('should delete article and return result', async () => {
            const result = await Article.delete(id);
            expect(result.changes).toBe(1);
            const article = await Article.findById(id);
            expect(article).toBeUndefined();
        });
    });

    describe('incrementViewCount', () => {
        let id;
        beforeEach(async () => { id = await Article.create({ title: 'View', content: 'y' }); });
        test('should increment view_count by 1', async () => {
            await Article.incrementViewCount(id);
            const article = await Article.findById(id);
            expect(article.view_count).toBe(1);
        });
    });

    describe('getCategoryStats', () => {
        beforeEach(async () => {
            await Article.create({ title: 'a', content: '1', category: '技术' });
            await Article.create({ title: 'b', content: '2', category: '技术' });
            await Article.create({ title: 'c', content: '3', category: '生活' });
        });
        test('should return counts grouped by category', async () => {
            const stats = await Article.getCategoryStats();
            const tech = stats.find(s => s.category === '技术');
            const life = stats.find(s => s.category === '生活');
            expect(tech.count).toBe(2);
            expect(life.count).toBe(1);
        });
    });

    describe('getTagStats', () => {
        beforeEach(async () => {
            await Article.create({ title: 'a', content: '1', tags: 'JavaScript, CSS' });
            await Article.create({ title: 'b', content: '2', tags: 'JavaScript' });
        });
        test('should return aggregated tag counts', async () => {
            const stats = await Article.getTagStats();
            const js = stats.find(s => s.name === 'JavaScript');
            expect(js.count).toBe(2);
        });
    });

    describe('getArchive', () => {
        beforeEach(async () => {
            await Article.create({ title: 'Old', content: 'old' });
            await Article.create({ title: 'New', content: 'new' });
        });
        test('should return articles ordered by created_at DESC', async () => {
            const data = await Article.getArchive();
            expect(data[0].title).toBe('New'); // newer first
        });
    });

    describe('Error handling (mock db failures)', () => {
        let originalPrepare;
        beforeAll(() => { originalPrepare = db.prepare; });
        afterEach(() => { db.prepare = originalPrepare; });

        test('findAll should throw on db error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(Article.findAll()).rejects.toThrow('fail');
        });

        test('findById should throw on db error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(Article.findById(1)).rejects.toThrow('fail');
        });

        test('create should throw on db error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(Article.create({ title: 'x', content: 'y' })).rejects.toThrow('fail');
        });

        test('update should throw on db error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(Article.update(1, { title: 'x', content: 'y', excerpt: 'z' })).rejects.toThrow('fail');
        });

        test('delete should throw on db error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(Article.delete(1)).rejects.toThrow('fail');
        });

        test('incrementViewCount should not throw on db error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            // incrementViewCount catches error internally, should not throw
            await expect(Article.incrementViewCount(1)).resolves.toBeUndefined();
        });

        test('getCategoryStats should throw on db error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(Article.getCategoryStats()).rejects.toThrow('fail');
        });

        test('getTagStats should return empty on error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            const result = await Article.getTagStats();
            expect(result).toEqual([]);
        });

        test('getArchive should throw on db error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(Article.getArchive()).rejects.toThrow('fail');
        });
    });

    describe('getAllMetadata', () => {
        test('should return categories and tags from metadata tables', async () => {
            const metadata = await Article.getAllMetadata();
            expect(metadata).toHaveProperty('categories');
            expect(metadata).toHaveProperty('tags');
            expect(metadata.categories).toContain('技术');
            expect(metadata.tags).toContain('JavaScript');
        });
    });

    describe('syncMetadata', () => {
        test('should insert new category and tag into metadata tables', () => {
            Article.syncMetadata('NewCat', 'NewTag');
            const cat = db.prepare('SELECT name FROM categories WHERE name = ?').get('NewCat');
            const tag = db.prepare('SELECT name FROM tags WHERE name = ?').get('NewTag');
            expect(cat.name).toBe('NewCat');
            expect(tag.name).toBe('NewTag');
        });

        test('should not crash when category and tags are null/undefined', () => {
            // 直接调用且不应抛出异常
            expect(() => Article.syncMetadata(null, null)).not.toThrow();
            expect(() => Article.syncMetadata(undefined, '')).not.toThrow();
            expect(() => Article.syncMetadata('Cat', undefined)).not.toThrow();
            // 数据库不应有 null 条目
            const cat = db.prepare('SELECT name FROM categories WHERE name = ?').get(null);
            expect(cat).toBeUndefined();
        });
    });
});