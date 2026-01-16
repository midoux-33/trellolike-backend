var express = require('express');
var router = express.Router();

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authMiddleWare');
const authController = require('../controllers/authController');


/* POST register new user */
router.post('/register', authController.register);

/* POST login user */

/* GET user profile */
router.get('/profiles', function(req, res) {
    User.find().then(data => {
        res.json({allUsers: data});
    })
});

module.exports = router;