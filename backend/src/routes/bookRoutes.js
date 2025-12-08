const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/', bookController.listBooks);
router.get('/:slug', bookController.getBook);
router.get('/:slug/pages', bookController.listPages);
router.get('/:slug/page', bookController.getPage);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, bookController.createBook);
router.patch('/:id', authMiddleware, adminMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, adminMiddleware, bookController.deleteBook);

// Page routes (admin)
router.post('/:bookId/pages', authMiddleware, adminMiddleware, bookController.createPage);
router.patch('/:bookId/pages/:pageId', authMiddleware, adminMiddleware, bookController.updatePage);
router.delete('/:bookId/pages/:pageId', authMiddleware, adminMiddleware, bookController.deletePage);

module.exports = router;
