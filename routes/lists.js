const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleWare');
const listController = require('../controllers/listController');

/* GET /api/lists - Get all lists for the authenticated user */

/* Post /api/lists - Create a new list */
router.post('/', authenticateToken, listController.createList);

/* GET /api/lists/:id - Get a specific list by ID */

/* Put /api/lists/:id - Update a specific list by ID */

/* DELETE /api/lists/:id - Delete a specific list by ID */

module.exports = router;