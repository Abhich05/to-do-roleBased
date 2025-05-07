const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const AuditLog = require('../models/AuditLog');

// Only admin can view audit logs
router.use(auth, roles(['admin']));

router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
