const articleController = require('../../controllers/articleController');
const Article = require('../../models/Article');
const { db, initDatabase } = require('../../config/database');

// Mock Article model
jest.mock('../../models/Article');

describe('Article Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { params: {}, query: {}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('getArticles', () => {
        test('should return articles with pagination', async () => {
            const mockArticles = [{ id: 1, title: 'Test' }];
            Article.findAll.mockResolvedValue({ articles: mockArticles, total: 1 });
            req.query = { page: 1, limit: 10 };
            await articleController.getArticles(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockArticles, total: 1 });
        });
        test('should handle errors', async () => {
            Article.findAll.mockRejectedValue(new Error('DB error'));
            await articleController.getArticles(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('createArticle', () => {
        test('should reject empty title', async () => {
            req.body = { title: '', content: 'x' };
            await articleController.createArticle(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
        test('should create article and return 201', async () => {
            Article.create.mockResolvedValue(10);
            req.body = { title: 'New', content: 'Content', category: 'Tech', tags: ['a'] };
            await articleController.createArticle(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: { id: 10 } })
            );
        });
    });

    // ... 其余方法类似（update, delete, getById等）
    describe('updateArticle', () => {
        test('should update article', async () => {
            Article.update.mockResolvedValue(true);
            req.params.id = 1;
            req.body = { title: 'Updated', content: 'New' };
            await articleController.updateArticle(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    describe('deleteArticle', () => {
        test('should return 404 if article not found', async () => {
            Article.findById.mockResolvedValue(null);
            req.params.id = 999;
            await articleController.deleteArticle(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
        test('should delete article', async () => {
            Article.findById.mockResolvedValue({ id: 1 });
            Article.delete.mockResolvedValue();
            req.params.id = 1;
            await articleController.deleteArticle(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    describe('getArchive', () => {
        test('should return archived articles', async () => {
            Article.getArchive.mockResolvedValue([{ id: 1, title: 'Arch' }]);
            await articleController.getArchive(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.any(Array) });
        });
    });

    describe('addCategory', () => {
        beforeEach(() => { req.body = { name: 'NewCat' }; });
        test('should add category', async () => {
            // mock db
            const mockStmt = { run: jest.fn() };
            jest.spyOn(db, 'prepare').mockReturnValueOnce(mockStmt);
            await articleController.addCategory(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: '分类已永久保存' });
            db.prepare.mockRestore();
        });

        test('should reject existing category (SQLITE_CONSTRAINT_UNIQUE)', async () => {
            const err = new Error('Unique constraint failed');
            err.code = 'SQLITE_CONSTRAINT_UNIQUE';
            jest.spyOn(db, 'prepare').mockImplementation(() => { throw err; });
            await articleController.addCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            db.prepare.mockRestore();
        });

        test('should handle general error', async () => {
            jest.spyOn(db, 'prepare').mockImplementation(() => { throw new Error('fail'); });
            await articleController.addCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            db.prepare.mockRestore();
        });
    });

    describe('getMetadata', () => {
        beforeEach(() => { req.body = {}; });

        test('should return metadata successfully', async () => {
            jest.spyOn(db, 'prepare').mockImplementation((sql) => {
                if (sql.includes('categories')) return { all: () => [{ name: 'cat1' }] };
                if (sql.includes('tags')) return { all: () => [{ name: 'tag1' }] };
                return { all: () => [] };
            });
            await articleController.getMetadata(req, res);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { categories: ['cat1'], tags: ['tag1'] }
            });
            db.prepare.mockRestore();
        });

        test('should handle database error', async () => {
            jest.spyOn(db, 'prepare').mockImplementation(() => { throw new Error('db error'); });
            await articleController.getMetadata(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            db.prepare.mockRestore();
        });
    });

    describe('addTag', () => {
        beforeEach(() => { req.body = { name: 'NewTag' }; });
        test('should add tag', async () => {
            const mockStmt = { run: jest.fn() };
            jest.spyOn(db, 'prepare').mockReturnValueOnce(mockStmt);
            await articleController.addTag(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: '标签已永久保存' });
            db.prepare.mockRestore();
        });

        test('should reject existing tag (SQLITE_CONSTRAINT_UNIQUE)', async () => {
            const err = new Error('Unique constraint failed');
            err.code = 'SQLITE_CONSTRAINT_UNIQUE';
            jest.spyOn(db, 'prepare').mockImplementation(() => { throw err; });
            await articleController.addTag(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            db.prepare.mockRestore();
        });

        test('should handle general error', async () => {
            jest.spyOn(db, 'prepare').mockImplementation(() => { throw new Error('fail'); });
            await articleController.addTag(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            db.prepare.mockRestore();
        });
    });

    describe('getStats', () => {
        test('should return category stats', async () => {
            Article.getCategoryStats.mockResolvedValue([{ category: 'tech', count: 3 }]);
            await articleController.getStats(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ category: 'tech', count: 3 }] });
        });
        test('should handle errors', async () => {
            Article.getCategoryStats.mockRejectedValue(new Error('fail'));
            await articleController.getStats(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getTagStats', () => {
        test('should return tag stats', async () => {
            Article.getTagStats.mockResolvedValue([{ name: 'js', count: 5 }]);
            await articleController.getTagStats(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ name: 'js', count: 5 }] });
        });
        test('should handle errors', async () => {
            Article.getTagStats.mockRejectedValue(new Error('fail'));
            await articleController.getTagStats(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});