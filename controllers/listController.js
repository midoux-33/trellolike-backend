// controller/listController.js
const TaskList = require('../models/TaskList');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');

exports.getAllLists = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Trouver toutes les listes où l'utilisateur est owner ou collaborator
        const lists = await TaskList.find({
            $or: [
                { owner: userId },
                { 'collaborators.user': userId }
            ]
        })
        .populate([
            { path: 'owner', select: 'username firstName lastName avatar -_id' },
            { path: 'collaborators.user', select: 'username firstName lastName avatar -_id' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Listes récupérées avec succès',
            lists: lists
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createList = async (req, res) => {

    try {

        // 1 récupérer les données du corps de la requête 
        const { title, description, color, collaborators } = req.body;   
        const owner = req.user.userId;
        let collaboratorsId = [];

        // vérifier si les collaborators existent dans user collection
        if (collaborators && collaborators.length > 0) {
           collaboratorsId = collaborators.map(collab => collab.collaboratorId);
           const users = await User.find({ _id: { $in: collaboratorsId } });
           const userMap = new Map(users.map(u => [u._id.toString(), u._id]));
           collaboratorsId = collaborators.map(collab => {
            const userId = userMap.get(collab.collaboratorId);
            if (!userId) {
                throw new Error(`Utilisateur collaborateur '${collab.collaboratorId}' non trouvé`);
            }
            return {user: userId, role: collab.role};
            })
        }

        // vérifier unicité du title
        const existingList = await TaskList.findOne({ title });
        if (existingList) {
            return res.status(409).json({
                success: false,
                message: "Une liste avec ce titre existe déjà"
            });
        }


        // 3 créer nouvelle Tasklist :

        const newList = await TaskList.create({
            title: title,
            description: description || '',
            color: color || '#FFFFFF',
            owner: owner,
            collaborators: collaboratorsId || [],
            isArchived: false
        });

        // populate owner et collaborators.user
        const populatedList = await newList
            .populate([
                { path: 'owner', select: 'username firstName lastName avatar -_id' },
                { path: 'collaborators.user', select: 'username email firstName lastName avatar -_id' }
            ])

        // 5 réponse

        res.status(201).json({
            success: true,
            message: 'Liste créée avec succès',
            list: populatedList
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getListById = async (req, res) => {
    try {
    // 1. Récupérer listId depuis req.params.listId
    const listId = req.params.listId;
    const userId = req.user.userId;
    // 2. Trouver la liste dans DB
    const list = await TaskList.findById(listId);
    if (!list) {
        return res.status(404).json({
            success: false,
            message: 'Liste non trouvée'
        });
    }

    // 3. IMPORTANT : Vérifier que req.user est :

    //    - soit owner de la liste
    //    - soit dans collaborators
    //    -< Si non -> 403 Forbidden
    if (userId !== list.owner.toString() && !list.collaborators.some(collab => collab.user.toString() === userId)) {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé'
        });
    }
    
    // 4. Populate owner + collaborators.user

    const populatedList = await list
        .populate([
            { path: 'owner', select: 'username firstName lastName avatar -_id' },
            { path: 'collaborators.user', select: 'username email firstName lastName avatar -_id' }
        ])
    res.status(200).json({
        success: true,
        list: populatedList
    });
    // 5. reponse avec la liste trouvée
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateList = async (req, res) => {
    try {
    // 1. Récupérer listId depuis req.params.listId

    const listId = req.params.listId;
    const userId = req.user.userId;
    // 2. Trouver la liste dans DB
    const list = await TaskList.findById(listId);
    if (!list) {
        return res.status(404).json({
            success: false,
            message: 'Liste non trouvée'
        });
    }
    // 3. permission check : owner ou collaborator avec role 'editor'
    if (userId !== list.owner.toString() && !list.collaborators.some(collab => collab.user.toString() === userId && collab.role === 'editor')) {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé'
        });
    }
    // 4. Mettre à jour les champs modifiables : title, description, color
    const { title, description, color } = req.body;
    if (title) list.title = title;
    if (description) list.description = description;
    if (color) list.color = color;

    // 5. Sauvegarder en DB
    await list.save();

    // 6. populate
    const populatedList = await list
        .populate([
            { path: 'owner', select: 'username firstName lastName avatar -_id' },
            { path: 'collaborators.user', select: 'username email firstName lastName avatar -_id' }
        ]);

    // 7. Réponse avec la liste mise à jour
    res.status(200).json({
        success: true,
        message: 'Liste mise à jour avec succès',
        list: populatedList
    });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteList = async (req, res) => {
    try {
    // 1. Récupérer listId depuis req.params.listId
    const listId = req.params.listId;
    const userId = req.user.userId;

    // 2. Trouver la liste dans DB
    const list = await TaskList.findById(listId);
    if (!list) {
        return res.status(404).json({
            success: false,
            message: 'Liste non trouvée'
        });
    }

    // 3. permission check : owner uniquement
    if (userId !== list.owner.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé'
        });
    }

    // 4. Supprimer la liste avec task associées
    await TaskList.findByIdAndDelete(listId);

    //  supprimer les tâches associées
    const deletedTasks = await Task.deleteMany({ list: listId });

    // 5. Réponse de succès

    res.status(200).json({
        success: true,
        message: deletedTasks.deletedCount ? `Liste et ${deletedTasks.deletedCount} tâches associées supprimées avec succès` : 'Liste supprimée avec succès'
    });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.addCollaborator = async (req, res) => {
    try {
        // 1. Récupérer listId depuis req.params.listId
        const listId = req.params.listId;
        const userId = req.user.userId;
        const { collaboratorsId, role } = req.body;

        const [list, collaboratorUser] = await Promise.all([
            TaskList.findById(listId),
            User.findById(collaboratorsId)
        ]);
        // verifier que userId est owner de la liste
        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'Liste non trouvée'
            });
        }
        if (userId !== list.owner.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        // 2. Récupérer collaborator info depuis req.body


        // 3. Vérifier que le collaborator existe
        if (!collaboratorUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur collaborateur non trouvé'
            });
        }

        if (userId.toString() === collaboratorUser._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Le propriétaire ne peut pas être ajouté comme collaborateur'
            });
        }
        // vérifier que le collaborator n'est pas déjà dans la liste
        if (list.collaborators.some(collab => collab.user.toString() === collaboratorsId.toString())) {
            return res.status(409).json({
                success: false,
                message: 'Collaborateur déjà ajouté à la liste'
            });
        }

        // 4. Ajouter le collaborator à la liste
        list.collaborators.push({ user: collaboratorsId, role: role });
        await list.save();

        const populatedList = await list
            .populate([
                { path: 'owner', select: 'username firstName lastName email' },
                { path: 'collaborators.user', select: 'username firstName lastName email' }
            ]);

        // 5. Réponse de succès
        res.status(200).json({
            success: true,
            message: 'Collaborateur ajouté avec succès',
            list: populatedList
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateCollaboratorRole = async (req, res) => {
    try {
        // 1. Récupérer listId depuis req.params.listId
        const listId = req.params.listId;
        const collaboratorsId = req.params.collaboratorId;
        const userId = req.user.userId;

        const { role } = req.body;


        // verifier que userId est owner de la liste
        const list = await TaskList.findById(listId);
        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'Liste non trouvée'
            });
        }

        if (userId !== list.owner.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }
        // 2. Trouver le collaborator dans la liste
        const collaborator = list.collaborators.find(collab => collab.user.toString() === collaboratorsId);
        if (!collaborator) {
            return res.status(404).json({
                success: false,
                message: 'Collaborateur non trouvé dans la liste'
            });
        }
        
        // verifier que le rôle est différent avant mise à jour
        if (collaborator.role === role) {
            return res.status(400).json({
                success: false,
                message: 'Le rôle du collaborateur est déjà défini sur ce rôle'
            });
        }

        // 3. Mettre à jour le rôle
        collaborator.role = role;
        await list.save();

        const populatedList = await list
            .populate([
                { path: 'owner', select: 'username firstName lastName email' },
                { path: 'collaborators.user', select: 'username firstName lastName email' }
            ])

        // 4. Réponse de succès
        res.status(200).json({
            success: true,
            message: 'Rôle du collaborateur mis à jour avec succès',
            list: populatedList
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.removeCollaborator = async (req, res) => {
    try {
        // 1. Récupérer listId depuis req.params.listId
        const listId = req.params.listId;
        const collaboratorsId = req.params.collaboratorId;
        const userId = req.user.userId;

        // verifier que userId est owner de la liste
        const list = await TaskList.findById(listId);
        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'Liste non trouvée'
            });
        }

        if (userId !== list.owner.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }

        // 2. Retirer le collaborator de la liste
        const initialLength = list.collaborators.length;
        list.collaborators = list.collaborators.filter(collab => collab.user.toString() !== collaboratorsId);
        if (list.collaborators.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Collaborateur non trouvé dans la liste'
            });
        }
        await list.save();

        const populatedList = await list
            .populate([
                { path: 'owner', select: 'username firstName lastName email' },
                { path: 'collaborators.user', select: 'username firstName lastName email' }
            ])

        // 3. Réponse de succès
        res.status(200).json({
            success: true,
            message: 'Collaborateur retiré avec succès',
            list: populatedList
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};