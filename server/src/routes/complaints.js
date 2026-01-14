const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { createComplaint, deleteComplaint, getComplaintById } = require('../controllers/complaintsController');

const router = express.Router();

router.post('/', authenticate, requireRole('RESIDENT', 'ADMIN'), createComplaint);

router.get('/:id', authenticate, requireRole('RESIDENT', 'ADMIN'), getComplaintById);

router.delete('/:id', authenticate, requireRole('RESIDENT', 'ADMIN'), deleteComplaint);

module.exports = router;
