var express = require('express');
var router = express.Router();

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authMiddleWare');
const authController = require('../controllers/authController');
const { body } = require('express-validator');


/* POST register new user */
router.post('/register',[
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 20 }).trim().escape(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty().trim().escape(),
    body('lastName').notEmpty().trim().escape(),
], authController.register);

/* POST login user */

/* GET user profile */
router.get('/profiles', function(req, res) {
    User.find().then(data => {
        res.json({allUsers: data});
    })
});

module.exports = router;