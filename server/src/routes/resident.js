const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { dashboard, updateProfile, changePassword } = require('../controllers/residentController');
const { listResidentComplaints } = require('../controllers/complaintsController');
const { listMyNotifications, markNotificationsRead } = require('../controllers/notificationsController');
const { listResidentVisitors } = require('../controllers/visitorsController');
const { listMyPreApprovals, createPreApproval, deleteMyPreApproval } = require('../controllers/preApprovalsController');

const router = express.Router();

router.get('/dashboard', authenticate, requireRole('RESIDENT', 'ADMIN'), dashboard);

router.put('/profile', authenticate, requireRole('RESIDENT', 'ADMIN'), updateProfile);

router.put('/password', authenticate, requireRole('RESIDENT', 'ADMIN'), changePassword);

router.get('/complaints', authenticate, requireRole('RESIDENT', 'ADMIN'), listResidentComplaints);

router.get('/notifications', authenticate, requireRole('RESIDENT', 'ADMIN'), listMyNotifications);

router.put('/notifications/read', authenticate, requireRole('RESIDENT', 'ADMIN'), markNotificationsRead);

router.get('/visitors', authenticate, requireRole('RESIDENT', 'ADMIN'), listResidentVisitors);

router.get('/pre-approvals', authenticate, requireRole('RESIDENT', 'ADMIN'), listMyPreApprovals);

router.post('/pre-approvals', authenticate, requireRole('RESIDENT', 'ADMIN'), createPreApproval);

router.delete('/pre-approvals/:id', authenticate, requireRole('RESIDENT', 'ADMIN'), deleteMyPreApproval);

module.exports = router;
