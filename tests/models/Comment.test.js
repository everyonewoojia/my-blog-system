const { db, initDatabase } = require('../../config/database');
const Comment = require('../../models/Comment');
const Article = require('../../models/Article');

beforeAll(() => { initDatabase(); });
beforeEach(async () => {
    db.exec('DELETE FROM articles; DELETE FROM comments;');
    // 重新插入文章用于外键
    await Article.create({ title: 'Test', content: 'for comment' });
});

describe('Comment Model', () => {
    let articleId;
    beforeEach(async () => {
        const article = db.prepare('SELECT id FROM articles LIMIT 1').get();
        articleId = article.id;
    });

    describe('create', () => {
        test('should create a comment', () => {
            const result = Comment.create({ article_id: articleId, author_name: 'Tester', content: 'Nice!' });
            expect(result.changes).toBe(1);
        });
    });

    describe('getByArticleId', () => {
        beforeEach(() => {
            Comment.create({ article_id: articleId, author_name: 'A', content: 'First' });
            Comment.create({ article_id: articleId, author_name: 'B', content: 'Second' });
        });
        test('should return comments ordered DESC', () => {
            const comments = Comment.getByArticleId(articleId);
            expect(comments.length).toBe(2);
            expect(comments[0].content).toBe('Second');
        });
    });

    describe('getAllCommentsWithTitle', () => {
        test('should return comments with article titles', async () => {
            Comment.create({ article_id: articleId, author_name: 'X', content: 'Y' });
            const comments = await Comment.getAllCommentsWithTitle();
            const first = comments[0];
            expect(first.article_title).toBeDefined();
        });
    });

    describe('delete', () => {
        test('should delete a comment by id', async () => {
            const result = Comment.create({ article_id: articleId, author_name: 'D', content: 'del' });
            const commentId = result.lastInsertRowid;
            const delResult = Comment.delete(commentId);
            expect(delResult.changes).toBe(1);
        });
    });

    describe('Error handling', () => {
        let originalPrepare;
        beforeAll(() => { originalPrepare = db.prepare; });
        afterEach(() => { db.prepare = originalPrepare; });

        test('create should throw on error', () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            expect(() => Comment.create({ article_id: 1, author_name: 'a', content: 'b' })).toThrow('fail');
        });

        test('getByArticleId should throw on error', () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            expect(() => Comment.getByArticleId(1)).toThrow('fail');
        });

        test('getAllCommentsWithTitle should throw on error', async () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            await expect(Comment.getAllCommentsWithTitle()).rejects.toThrow('fail');
        });

        test('delete should throw on error', () => {
            db.prepare = jest.fn(() => { throw new Error('fail'); });
            expect(() => Comment.delete(1)).toThrow('fail');
        });
    });
});