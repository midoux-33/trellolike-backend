var express = require('express');
var router = express.Router();

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

module.exports = router;
