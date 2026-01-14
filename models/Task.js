const mongoose = require('mongoose');

// sous-schema comment
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  // ===== AUTH =====
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    maxlength: 200,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tasklist',
    required: [true, 'La liste est requise']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [{
    type: String,
  }],
  comments: [commentSchema],
  }, {
  timestamps: true
  }) 

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;