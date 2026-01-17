const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ===== AUTH =====
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^.+@.+\..+$/, 'Email invalide']
  },
  username: {
    type: String,
    required: [true, 'Pseudo requis'],
    unique: true,
    trim: true,
    minlength: [3, 'Le pseudo doit faire au moins 3 caractères'],
    maxlength: [20, 'Le pseudo ne doit pas dépasser 20 caractères']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe requis'],
    minlength: [6, 'Le mot de passe doit faire au moins 6 caractères']
  },
  firstName: {type: String,required: [true, 'Prénom requis']},
  lastName: {type: String,required: [true, 'Nom requis']},
  avatar: {type: String, default: null},
  avatarPublicId: {type: String, default: null},
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },  {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
  }) 

// ===== DEFAULT AVATAR =====

userSchema.virtual('defaultAvatar').get(function() {
    if(this.avatar) return this.avatar;
    return `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&size=200background=4f46ca&color=fff&rounded=true`;
});

// ===== PRE-SAVE MIDDLEWARE =====
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// ===== INSTANCE METHODS =====
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
