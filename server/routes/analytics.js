const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const Task = require('../models/Task');

// Only admin and manager can view analytics
router.use(auth, roles(['admin', 'manager']));

// Completed tasks per user
router.get('/completed-per-user', async (req, res) => {
  try {
    const data = await Task.aggregate([
      { $match: { status: 'done' } },
      { $group: { _id: '$createdBy', count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Overdue tasks count
router.get('/overdue', async (req, res) => {
  try {
    const now = new Date();
    const count = await Task.countDocuments({ status: { $ne: 'done' }, dueDate: { $lt: now } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Task completion rates by month
router.get('/completion-rate', async (req, res) => {
  try {
    const data = await Task.aggregate([
      { $match: { status: 'done' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
        count: { $sum: 1 }
      }}
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
