var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/test-user', async (req, res) => {
   try {
    const User = require('../models/User');
    const user = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    await user.save();
    res.json({ success: true, user: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
