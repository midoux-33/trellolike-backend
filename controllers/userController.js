const User = require('../models/User');

exports.searchUsers = async (req, res) => {
 
    try {
        const { q } = req.query;
        const currentUserId = req.user.userId;
        if(!q || q.length < 2) {
            return res.status(200).json({
                success: true,
                users: []
            });
        }

        const users = await User.find({
            username: { $regex: q, $options: 'i' },
            _id: { $ne: currentUserId } // Exclude current user
        }).select('username firstName lastName email')
        .lean()
        .limit(10);

        res.status(200).json({
            success: true,
            users: users
            });
        } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};