const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');
const roles = require('../middleware/roles');

// All routes below require authentication
router.use(auth);

// CRUD
// Only admin and manager can create tasks for anyone; user can only assign to self
router.post('/', roles(['admin', 'manager', 'user']), taskController.createTask);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);

// Only admin can update any task, manager can update if assigned, user can update if creator
router.put('/:id', roles(['admin', 'manager', 'user']), taskController.updateTask);

// Only admin can delete any task, user/manager can delete if creator
router.delete('/:id', roles(['admin', 'manager', 'user']), taskController.deleteTask);

module.exports = router;
