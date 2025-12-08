const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Articles
router.get('/', knowledgeController.listArticles);
router.get('/:id', knowledgeController.getArticle);

// Admin article routes
router.post('/', authMiddleware, adminMiddleware, knowledgeController.createArticle);
router.patch('/:id', authMiddleware, adminMiddleware, knowledgeController.updateArticle);
router.delete('/:id', authMiddleware, adminMiddleware, knowledgeController.deleteArticle);

// Categories
router.get('/categories/list', knowledgeController.listCategories);
router.post('/categories/create', authMiddleware, adminMiddleware, knowledgeController.createCategory);

module.exports = router;
