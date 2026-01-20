const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleWare');
const listController = require('../controllers/listController');
const validateRequest = require('../middleware/validateRequest');
const { body, param } = require('express-validator');

/* GET /api/lists - Get all lists for the authenticated user */
router.get('/', authenticateToken, listController.getAllLists);

/* Post /api/lists - Create a new list */
router.post('/',[ 
    authenticateToken,
    body('title').notEmpty().isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('color').optional().isHexColor().withMessage('Couleur invalide'),
    validateRequest
], listController.createList);

/* GET /api/lists/:id - Get a specific list by ID */
router.get('/:listId', [
    authenticateToken,
    param('listId').isMongoId().withMessage('list ID invalide'),
    validateRequest
], listController.getListById);

/* Put /api/lists/:id - Update a specific list by ID */
router.put('/:listId', [
    authenticateToken,
    param('listId').isMongoId().withMessage('list ID invalide'),
    body('title').optional().notEmpty().isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('color').optional().isHexColor().withMessage('Couleur invalide'),
    validateRequest
], listController.updateList);

/* DELETE /api/lists/:id - Delete a specific list by ID */
router.delete('/:listId', [
    authenticateToken,
    param('listId').isMongoId().withMessage('list ID invalide'),
    validateRequest
], listController.deleteList);

/* post /api/lists/:listId/collaborators - Add a collaborator to a list */
router.post('/:listId/collaborators', [
    authenticateToken,
    param('listId').isMongoId().withMessage('list ID invalide'),
    body('collaboratorsId').notEmpty().isString().withMessage('Nom d\'utilisateur invalide ou manquant'),
    body('role').notEmpty().isIn(['viewer', 'editor']).withMessage('Rôle invalide'),
    validateRequest
], listController.addCollaborator);

/* put /api/lists/:listId/collaborators/:collaboratorId - Update a collaborator's role */
router.put('/:listId/collaborators/:collaboratorId', [
    authenticateToken,
    param('listId').isMongoId().withMessage('list ID invalide'),
    param('collaboratorId').isMongoId().withMessage('collaborator ID invalide'),
    body('role').notEmpty().isIn(['viewer', 'editor']).withMessage('Rôle invalide'),
    validateRequest
], listController.updateCollaboratorRole);

/* DELETE /api/lists/:listId/collaborators/:collaboratorId - Remove a collaborator from a list */
router.delete('/:listId/collaborators/:collaboratorId', [
    authenticateToken,
    param('listId').isMongoId().withMessage('list ID invalide'),
    param('collaboratorId').isMongoId().withMessage('collaborator ID invalide'),
    validateRequest
], listController.removeCollaborator);

module.exports = router;