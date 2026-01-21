// controller/taskController.js

const TaskList = require('../models/TaskList');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');

exports.getTasksByList = async (req, res) => {
    try {
        const listId = req.params.listId;
        const userId = req.user.userId;

        // Vérifier que la liste existe
        const taskList = await TaskList.findById(listId);
        if (!taskList) {
            return res.status(404).json({ success: false, message: 'Liste non trouvée' });
        }

        // Vérifier que l'utilisateur a le droit d'accéder à cette liste (owner ou collaborator)
        if (userId !== taskList.owner.toString() && !taskList.collaborators.some(collab => collab.user.toString() === userId)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        // calcul pagination (page, limit, skip a partir de req.query)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await Task.countDocuments({list: listId});

        // Récupérer les tâches associées à cette liste
        const tasks = await Task.find({ list: listId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate([
                { path: 'list', select: 'title description color' },
                { path: 'createdBy', select: 'username email avatar' },
                { path: 'assignedTo', select: 'username email avatar' }
            ]).lean()

        res.status(200).json({
            success: true,
            tasks,
            meta: { page, limit, total, hasMore: total > page * limit }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, dueDate, comments } = req.body;
        const listId = req.params.listId;
        const userId = req.user.userId;

        // Vérifier que la liste existe
        const taskList = await TaskList.findById(listId);
        if (!taskList) {
            return res.status(404).json({ success: false, message: 'Liste non trouvée' });
        }

        // Vérifier que l'utilisateur a le droit d'ajouter une tâche à cette liste (owner ou collaborator editor)
        if (userId !== taskList.owner.toString() && !taskList.collaborators.some(collab => collab.user.toString() === userId && collab.role === 'editor')) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        
        // vérifier que assignedTo est un utilisateur valide s'il est fourni
        if (assignedTo) {
            const assignedUser = await User.findById(assignedTo);
            if (!assignedUser) {
                return res.status(400).json({ success: false, message: 'Utilisateur assigné non trouvé' });
            }
        }

        // Créer la tâche
        const newTask = await Task.create({
            title,
            description,
            list: listId,
            createdBy: userId,
            assignedTo: assignedTo || null,
            priority: priority || 'medium',
            dueDate: dueDate || null,
            comments: comments || []
        });
        // ajouter task à la liste
        taskList.tasks.push(newTask._id);
        await taskList.save();

        // populer les références
        const populatedTask = await newTask
            .populate([
                {path: 'list', select: 'title'},
                {path: 'createdBy', select: 'username email'},
                {path: 'assignedTo', select: 'username email'}
            ]);

        // réponse 

        res.status(201).json({
            success: true,
            message: 'Tâche créée avec succès',
            task: populatedTask
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.user.userId;

        // vérifier que la tâche existe
        const populatedTask = await Task.findById(taskId)
            .populate([
                { path: 'list', select: 'title description color owner collaborators' },
                { path: 'createdBy', select: 'username email' },
                { path: 'assignedTo', select: 'username email' }
            ]);

        console.log('Populated Task:', populatedTask);

        if (!populatedTask) {
            return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
        }

        if(!populatedTask.list) {
            return res.status(404).json({ success: false, message: 'Liste non trouvée' });
        }

        // vérifier que l'utilisateur fais partie de la liste (owner ou collaborator)
        const taskList = populatedTask.list;
        const isOwner = userId === taskList.owner.toString();
        const isCollaborator = taskList.collaborators.some(collab => collab.user.toString() === userId);
        if (!isOwner && !isCollaborator) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }
        // réponse

        res.status(200).json({
            success: true,
            task: populatedTask
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.user.userId;
        let updateData = req.body;

        // vérifier que la tâche existe
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
        }

        // vérifier que l'utilisateur a le droit de modifier cette tâche (owner ou collaborator editor)
        const taskList = await TaskList.findById(task.list);
        if (userId !== taskList.owner.toString() && !taskList.collaborators.some(collab => collab.user.toString() === userId && collab.role === 'editor')) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        // si status "done" -> enregistrer completedBy
        if (updateData.status === 'done' && task.status !== 'done') {
            updateData.completedBy = userId;
        }

        // si status !== "done" effacer completedBy 
        if (updateData.status  && updateData.status !== 'done' && task.status === 'done') {
            updateData.completedBy = null;
        }

        // mettre à jour la tâche
        Object.assign(task, updateData);
        await task.save();

        // populer les références
        const populatedTask = await task
            .populate([
                { path: 'list', select: 'title description color' },
                { path: 'createdBy', select: 'username email avatar' },
                { path: 'assignedTo', select: 'username email avatar' },
                { path: 'completedBy', select: 'username email avatar'}
            ]);

        // réponse

        res.status(200).json({
            success: true,
            message: 'Tâche mise à jour avec succès',
            task: populatedTask
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.user.userId;

        // vérifier que la tâche existe
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Tâche non trouvée' });
        }

        // vérifier que l'utilisateur a le droit de supprimer cette tâche (owner ou collaborator editor)
        const taskList = await TaskList.findById(task.list);
        if (userId !== taskList.owner.toString() && !taskList.collaborators.some(collab => collab.user.toString() === userId && collab.role === 'editor')) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        // supprimer la tâche
        await Task.findByIdAndDelete(taskId);

        // réponse

        res.status(200).json({
            success: true,
            message: 'Tâche supprimée avec succès'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};