const validateUpdate = (req, res, next) => {
  const updates = Object.entries(req.body || {})
    .reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Au moins un champ à modifier requis'
    });
  }

  req.body = updates;
  next();
};

module.exports = validateUpdate;
