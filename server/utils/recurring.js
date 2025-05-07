const Task = require('../models/Task');
const RecurringRule = require('../models/RecurringRule');

function getNextDueDate(current, rule) {
  const next = new Date(current);
  if (rule.frequency === 'daily') {
    next.setDate(next.getDate() + (rule.interval || 1));
  } else if (rule.frequency === 'weekly') {
    next.setDate(next.getDate() + 7 * (rule.interval || 1));
  } else if (rule.frequency === 'monthly') {
    next.setMonth(next.getMonth() + (rule.interval || 1));
  }
  return next;
}

async function generateNextTaskInstance(task) {
  if (!task.recurringRule) return;
  const rule = await RecurringRule.findById(task.recurringRule);
  if (!rule) return;
  const nextDueDate = getNextDueDate(task.dueDate, rule);
  if (rule.endDate && nextDueDate > rule.endDate) return;
  return Task.create({
    title: task.title,
    description: task.description,
    dueDate: nextDueDate,
    priority: task.priority,
    status: 'todo',
    createdBy: task.createdBy,
    assignedTo: task.assignedTo,
    recurringRule: rule._id
  });
}

module.exports = { generateNextTaskInstance };
