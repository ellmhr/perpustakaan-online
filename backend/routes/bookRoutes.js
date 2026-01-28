const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/upload');

// All book routes require authentication
router.get('/', authMiddleware, bookController.getAllBooks);
router.get('/popular', authMiddleware, bookController.getPopularBooks);
router.get('/latest', authMiddleware, bookController.getLatestBooks);
router.get('/search', authMiddleware, bookController.searchBooks);
router.get('/:id', authMiddleware, bookController.getBookById);

// Upload book cover (for admin - will be added later)
router.post('/:id/upload-cover', authMiddleware, upload.single('cover'), bookController.uploadCover);

module.exports = router;
