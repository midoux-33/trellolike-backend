// controller/listController.js
const TaskList = require('../models/TaskList');
const jwt = require('jsonwebtoken');
const { checkBody } = require('../utils/checkBody');

exports.createList = async (req, res) => {
    try {
        // 1 récupérer les données du corps de la requête      
        // 2 valider title existe et non vide
        // 3 créer nouvelle Tasklist :
        // -title, description, color
        // owner
        //collaborators
        //isArchived=false
        // 4 sauvegarder en DB
        // populate owner et collaborators.user
        // 5 réponse

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getListById = async (req, res) => {
    try {
     // 1. Récupérer listId depuis req.params.listId
    // 2. Trouver la liste dans DB
    // 3. IMPORTANT : Vérifier que req.user est :
    //    - soit owner de la liste
    //    - soit dans collaborators
    //    -< Si non -> 403 Forbidden
    // 4. Populate owner + collaborators.user
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

