const mongoose = require('mongoose');

// Sous-schema Collaborator
const collaboratorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ["owner", "editor", "viewer"],
        default: "editor"
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const tasklistSchema = new mongoose.Schema({
  // ===== AUTH =====
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner est requis']
  },
  collaborators: [collaboratorSchema],
  color: {
    type: String,
    default: '#3498db'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  }, {
  timestamps: true
  }) 

const Tasklist = mongoose.model('Tasklist', tasklistSchema);

module.exports = Tasklist;