const commentController = require('../../controllers/commentController');
const Comment = require('../../models/Comment');

jest.mock('../../models/Comment');

describe('Comment Controller', () => {
    let req, res;
    beforeEach(() => {
        req = { params: {}, body: {} };
        res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    });

    describe('getComments', () => {
        test('should return comments for article', () => {
            const mockComments = [{ id: 1, content: 'Great!' }];
            Comment.getByArticleId.mockReturnValue(mockComments);
            req.params.articleId = 1;
            commentController.getComments(req, res);
            expect(res.json).toHaveBeenCalledWith(mockComments);
        });
    });

    describe('addComment', () => {
        test('should reject empty fields', () => {
            req.body = { author_name: '', content: '' };
            commentController.addComment(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
        test('should create comment', () => {
            Comment.create.mockReturnValue({ lastInsertRowid: 1 });
            req.params.articleId = 1;
            req.body = { author_name: 'User', content: 'Hello' };
            commentController.addComment(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: '评论发表成功' });
        });
    });

    describe('deleteComment', () => {
        test('should delete comment when exists', async () => {
            Comment.delete.mockReturnValue({ changes: 1 });
            req.params.id = 1;
            await commentController.deleteComment(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: '评论已删除' });
        });
        test('should return 404 when not found', async () => {
            Comment.delete.mockReturnValue({ changes: 0 });
            req.params.id = 99;
            await commentController.deleteComment(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});