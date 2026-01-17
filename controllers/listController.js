// controller/listController.js
const TaskList = require('../models/TaskList');
const jwt = require('jsonwebtoken');
const { checkBody } = require('../utils/checkBody');
const User = require('../models/User');

exports.createList = async (req, res) => {

    try {

        // 1 récupérer les données du corps de la requête 
        const { title, description, color, collaborators } = req.body;   
        const owner = req.user.userId;
        const collaboratorsId = [];

        console.log('collaborators reçus :', collaborators);
        // 2 valider title existe et non vide

        const requiredFields = ['title'];

        if (!checkBody(req.body, requiredFields).isValid) {
            return res.status(400).json({
                success: false,
                message: checkBody(req.body, requiredFields).message
            });
        }

        // vérifier si les collaborators existent dans user collection
        if (collaborators && collaborators.length > 0) {
            for (let collab of collaborators) {
                console.log('Vérification collaborateur :', collab.username, collab.role);
                const userExists = await User.findOne({ username: collab.username });
                if (!userExists) {
                    return res.status(404).json({
                        success: false,
                        message: `Collaborateur ${collab.user} non trouvé`
                    });
                }
                collaboratorsId.push({user: userExists._id, role: collab.role});
            }
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
                { path: 'owner', select: 'username  firstName lastName avatar -_id' },
                { path: 'collaborators.user', select: 'userName email firstName lastName avatar -_id' }
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
    console.log('Récupération liste pour userId :', userId);
    // 2. Trouver la liste dans DB
    const list = await TaskList.findById(listId);
    if (!list) {
        return res.status(404).json({
            success: false,
            message: 'Liste non trouvée'
        });
    }
    console.log('Liste trouvée :', list.owner.toString(), list.collaborators);

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
        ]);
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
    // 2. Trouver la liste dans DB
    // 3. permission check : owner ou collaborator avec role 'editor'
    // 4. Mettre à jour les champs modifiables : title, description, color
    // 5. Sauvegarder en DB
    // 6. populate
    // 7. Réponse avec la liste mise à jour
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteList = async (req, res) => {
    try {
    // 1. Récupérer listId depuis req.params.listId
    // 2. Trouver la liste dans DB
    // 3. permission check : owner uniquement
    // 4. Supprimer la liste avec task associées
    // 5. Réponse de succès
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

