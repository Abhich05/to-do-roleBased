const Task = require('../models/Task');
const User = require('../models/User');
const RecurringRule = require('../models/RecurringRule');
const AuditLog = require('../models/AuditLog');
const { notifyUser } = require('../socket');

// Create Task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, recurringRule } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required.' });
    let recurringRuleDoc = null;
    if (recurringRule && recurringRule.frequency) {
      recurringRuleDoc = await RecurringRule.create(recurringRule);
    }
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
      recurringRule: recurringRuleDoc ? recurringRuleDoc._id : null
    });
    // Real-time notification for assignment
    if (assignedTo) {
      notifyUser(assignedTo, 'taskAssigned', {
        message: `A new task "${title}" has been assigned to you.`,
        taskId: task._id
      });
    }
    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      targetType: 'Task',
      targetId: task._id,
      details: { title, assignedTo, recurringRule: recurringRuleDoc }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get All Tasks (with filters)
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, dueDate, search, assigned } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    // assigned=me for tasks assigned to current user
    if (assigned === 'me') filter.assignedTo = req.user.id;
    const tasks = await Task.find(filter).populate('createdBy', 'name email').populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get Single Task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'name email').populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Update Task
const { generateNextTaskInstance } = require('../utils/recurring');
exports.updateTask = async (req, res) => {
  try {
    const updates = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    // RBAC: Only admin can update any task, manager if assigned, user if creator
    if (req.user.role !== 'admin') {
      if (req.user.role === 'manager' && (!task.assignedTo || task.assignedTo.toString() !== req.user.id)) {
        return res.status(403).json({ message: 'Forbidden: managers can only update tasks assigned to them.' });
      }
      if (req.user.role === 'user' && task.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: users can only update their own tasks.' });
      }
    }
    const wasAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;
    Object.assign(task, updates);
    await task.save();
    // Notify new assigned user if changed
    if (updates.assignedTo && updates.assignedTo !== wasAssignedTo) {
      notifyUser(updates.assignedTo, 'taskAssigned', {
        message: `A task "${task.title}" has been assigned to you.`,
        taskId: task._id
      });
    }
    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      targetType: 'Task',
      targetId: task._id,
      details: updates
    });
    // If task is marked done and has recurrence, generate next instance
    if (updates.status === 'done' && task.recurringRule) {
      await generateNextTaskInstance(task);
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    // RBAC: Only admin can delete any task, manager/user only if creator
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: only admin or creator can delete this task.' });
    }
    await task.deleteOne();
    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      targetType: 'Task',
      targetId: task._id,
      details: { title: task.title }
    });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
