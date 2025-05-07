const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in progress', 'done'], default: 'todo' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notificationSent: { type: Boolean, default: false },
  recurringRule: { type: mongoose.Schema.Types.ObjectId, ref: 'RecurringRule', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
