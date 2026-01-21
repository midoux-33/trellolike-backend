var express = require('express');
var router = express.Router();

const taskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/authMiddleWare');
const validateRequest = require('../middleware/validateRequest');
const validateUpdate = require('../middleware/validateUpdate');
const { query, param, body } = require('express-validator');

/* GET tasks listing. */
router.get('/list/:listId',[
  authenticateToken,
  param('listId').isMongoId().withMessage('ID de la liste invalide'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest], taskController.getTasksByList);

/* POST create new task */
router.post('/:listId',[
  authenticateToken,
  param('listId').isMongoId().withMessage('ID de la liste invalide'),
  body('title').isLength({ min: 2, max: 100 }).trim().escape(),
  body('description').optional().isLength({ max: 500 }).trim().escape(),
  body('assignedTo').optional().isMongoId().withMessage('ID utilisateur invalide'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priorité invalide'),
  body('dueDate').optional().isISO8601().toDate(),
  validateRequest], taskController.createTask);

/* Get task by ID */
router.get('/:taskId',[
  authenticateToken,
  param('taskId').isMongoId().withMessage('ID de la tâche invalide'),
  validateRequest], taskController.getTaskById);

/* PUT update task */
router.put('/:taskId',[
  authenticateToken,
  param('taskId').isMongoId().withMessage('ID de la tâche invalide'),
  body('title').optional().isLength({ min: 2, max: 100 }).trim().escape(),
  body('description').optional().isLength({ max: 500 }).trim().escape(),
  body('assignedTo').optional().isMongoId().withMessage('ID utilisateur invalide'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priorité invalide'),
  body('dueDate').optional().isISO8601().toDate(),
  body('comments').optional().isArray(),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Statut invalide'),
  validateRequest, validateUpdate], taskController.updateTask);

/* DELETE task */
router.delete('/:taskId',[
  authenticateToken,
  param('taskId').isMongoId().withMessage('ID de la tâche invalide'),
  validateRequest], taskController.deleteTask);


module.exports = router;
