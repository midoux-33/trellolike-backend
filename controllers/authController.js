// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
  // 1. Vérifier erreurs validation
  // 2. Vérifier user existe déjà
  // 3. Créer user (bcrypt auto)
  // 4. Générer JWT
  // 5. Réponse { user, token }
};

exports.login = async (req, res) => {
  // 1. Email + password
  // 2. User.findOne({ email })
  // 3. bcrypt.compare
  // 4. JWT
  // 5. Réponse
};
