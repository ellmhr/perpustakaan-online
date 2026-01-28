const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middleware/authMiddleware');

// All loan routes require authentication
router.post('/', authMiddleware, loanController.createLoan);
router.get('/my-loans', authMiddleware, loanController.getMyLoans);
router.get('/history', authMiddleware, loanController.getLoanHistory);
router.get('/:id', authMiddleware, loanController.getLoanDetail);
router.put('/:id_peminjaman/return', authMiddleware, loanController.returnBook);

module.exports = router;
