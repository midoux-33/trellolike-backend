const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleWare');
const listController = require('../controllers/listController');
const { param, body } = require('express-validator');

/* GET /api/lists - Get all lists for the authenticated user */

/* Post /api/lists - Create a new list */
router.post('/', authenticateToken, listController.createList);

/* GET /api/lists/:id - Get a specific list by ID */
router.get('/:listId', [
    authenticateToken,
    param('listId').isMongoId().withMessage('list ID invalide'),
    body('title').notEmpty().isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
], listController.getListById);

/* Put /api/lists/:id - Update a specific list by ID */

/* DELETE /api/lists/:id - Delete a specific list by ID */

module.exports = router;