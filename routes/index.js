var express = require('express');
var router = express.Router();
const User = require('../models/User');
const TaskList = require('../models/TaskList');
const Task = require('../models/Task');
const mongoose = require('mongoose');


/* GET home page. */
router.get('/', (req, res,) => {
  res.json({
      message: 'Task Manager API ✅',
      version: '1.0.0',
      status: 'OK',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/',
        '/auth/register (POST)',
        '/auth/login (POST)',
        '/lists (GET)'
      ]
    });
});

router.get('/test-models', async (req, res) => {
  let testUser, testList, testTask;
  
  try {

    //  CRÉATION users, list, task
    testUser = await new User({
      email: `test-${Date.now()}@example.com`, 
      username: `testuser-123`,
      password: '123456',
      firstName: 'Test',
      lastName: 'User'
    }).save();
    
    testList = await new TaskList({
      title: 'Test List',
      owner: testUser._id,
      collaborators: [{ user: testUser._id, role: 'editor' }]
    }).save();
    
    testTask = await new Task({
      title: 'Test Task',
      list: testList._id,
      createdBy: testUser._id,
      comments: [{ user: testUser._id, text: 'Test comment' }]
    }).save();
    
    //  SUPPRESSION
    await User.findByIdAndDelete(testUser._id);
    await TaskList.findByIdAndDelete(testList._id);
    await Task.findByIdAndDelete(testTask._id);
   
    res.json({
      message: 'Test + CLEANUP précis OK !',
      created: { user: testUser._id, list: testList._id, task: testTask._id },
      status: '🗑️ Supprimés'
    });
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
