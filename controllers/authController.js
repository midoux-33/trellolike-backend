// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { checkBody } = require('../utils/checkBody');
const { uploadAvatar } = require('../services/uploadService');

exports.register = async (req, res) => {

    try {
  // 1. Vérifier erreurs validation
   const { email, username, password, firstName, lastName, } = req.body;

   const requiredFields = ['email', 'username', 'password'];
    if(!checkBody(req.body, requiredFields).isValid) {
      return res.status(400).json({
        success: false,
        message: checkBody(req.body, requiredFields).message
      });
    }



  // 2. Vérifier user existe déjà
    const existingUser = await User.findOne({$or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Utilisateur déjà existant"
        });
    }

  // verif avatar

    let avatarUrl = null;
    let avatarPublicId = null;
    
  // 3. Créer user + sauvegarder
    if(req.file) {
        const avatarData = await uploadAvatar(req.file);
        if(avatarData) {
            avatarUrl = avatarData.url;
            avatarPublicId = avatarData.public_id;
        }
    }
        const newUser = await User.create({
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            avatar: avatarUrl,
            avatarPublicId: avatarPublicId
        });

  // 4. Générer JWT

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

  // 5. Réponse { user, token }
  const userResponse = newUser.toJSON();
    res.status(201).json({
        success: true,
        message: 'utilisateur créé avec succès',
        user: {
            id: userResponse._id,
            email: userResponse.email,
            username: userResponse.username,
            firstName: userResponse.firstName,
            lastName: userResponse.lastName,
            Avatar: userResponse.defaultAvatar,
        },
        token: token
    });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
};

exports.login = async (req, res) => {
    
    // 1. Email + password
    try {
        const { email, password } = req.body;

        const requiredFields = ['email', 'password'];
    if(!checkBody(req.body, requiredFields).isValid) {
      return res.status(400).json({
        success: false,
        message: checkBody(req.body, requiredFields).message
      });
    }

  // 2. User.findOne({ email })
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

  // 3. Vérifier password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

  // 4. JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

  // 5. Réponse

    const userResponse = user.toJSON();
    res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        user: {
            id: userResponse._id,
            email: userResponse.email,
            username: userResponse.username,
            firstName: userResponse.firstName,
            lastName: userResponse.lastName,
            Avatar: userResponse.defaultAvatar,
        },
        token: token
    });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
};
