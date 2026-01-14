const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { dashboard, listFlats, createFlat, updateFlat, deleteFlat, listFlatOpenComplaints, listMaintenance, updateMaintenance } = require('../controllers/adminController');
const { listAllComplaints, updateComplaint, listComplaintComments, addComplaintComment } = require('../controllers/complaintsController');
const { createNotice, updateNotice, deleteNotice } = require('../controllers/noticesController');
const { listAdminVisitors, createVisitor, checkoutVisitor } = require('../controllers/visitorsController');
const { listAllPreApprovals, checkinPreApproval } = require('../controllers/preApprovalsController');
const { createResident, resetAllResidentPasswords } = require('../controllers/adminResidentsController');

const router = express.Router();

router.get('/dashboard', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), dashboard);

router.get('/flats', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), listFlats);

router.post('/flats', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), createFlat);

router.put('/flats/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), updateFlat);

router.delete('/flats/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), deleteFlat);

router.get('/flats/:id/complaints', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), listFlatOpenComplaints);

router.get('/maintenance', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), listMaintenance);

router.put('/maintenance/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), updateMaintenance);

router.get('/complaints', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), listAllComplaints);

router.put('/complaints/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), updateComplaint);

router.get('/complaints/:id/comments', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), listComplaintComments);

router.post('/complaints/:id/comments', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), addComplaintComment);

router.post('/notices', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), createNotice);

router.put('/notices/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), updateNotice);

router.delete('/notices/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), deleteNotice);

router.get('/visitors', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), listAdminVisitors);

router.post('/visitors', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), createVisitor);

router.put('/visitors/:id/checkout', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), checkoutVisitor);

router.get('/pre-approvals', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), listAllPreApprovals);

router.post('/pre-approvals/:id/checkin', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), checkinPreApproval);

// Residents management
router.post('/residents', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), createResident);

router.post('/residents/reset-passwords', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), resetAllResidentPasswords);

module.exports = router;
