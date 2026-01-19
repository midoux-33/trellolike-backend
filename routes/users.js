var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleWare');
const validateRequest = require('../middleware/validateRequest');
const { query } = require('express-validator');

/* GET users listing. */
router.get('/search',[
  authenticateToken,
  query('q').optional().isLength({ min: 2, max: 50 }).trim().escape(),
  validateRequest], userController.searchUsers);


module.exports = router;
