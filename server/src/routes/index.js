const express = require('express');
const authRoutes = require('./auth');
const residentRoutes = require('./resident');
const noticeRoutes = require('./notices');
const adminRoutes = require('./admin');
const complaintRoutes = require('./complaints');
const maintenanceRoutes = require('./maintenance');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/resident', residentRoutes);
router.use('/notices', noticeRoutes);
router.use('/complaints', complaintRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
