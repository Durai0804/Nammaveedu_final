const express = require('express');
const { authenticate } = require('../middleware/auth');
const { listNotices } = require('../controllers/noticesController');

const router = express.Router();

router.get('/', authenticate, listNotices);

module.exports = router;
