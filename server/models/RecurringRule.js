const mongoose = require('mongoose');

const recurringRuleSchema = new mongoose.Schema({
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  interval: { type: Number, default: 1 }, // every N days/weeks/months
  endDate: { type: Date },
});

module.exports = mongoose.model('RecurringRule', recurringRuleSchema);
