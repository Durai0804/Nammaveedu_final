const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { history } = require('../controllers/maintenanceController');

const router = express.Router();

// Residents can view their own history; admins can pass flatNumber to query any flat
router.get('/history', authenticate, requireRole('RESIDENT', 'ADMIN'), history);

module.exports = router;
