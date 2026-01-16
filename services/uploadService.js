const cloudinary = require('cloudinary').v2;

// ---- configuration -----
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- upload function -----
exports.uploadAvatar = async (file) => {
    try {
        if (!file) {
            return null;
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
        
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'avatars',
                resource_type: 'auto',
                width: 200,
                height: 200,
                crop: 'fill' 
            },
            (error, result) => {
                if (error) {
                    reject('Cloudinary upload error: ' + error.message);
                } else {
                    resolve(result);
                }
            }
        )
        
        stream.end(file.buffer);
        });
        return {
            url: result.secure_url,
            publicId: result.public_id
        };

        } catch (error) {
            console.error('Erreur upload Cloudinary :', error);
            throw new Error('Erreur lors de l\'upload de l\'avatar');
        }
    };

// ---- delete Avatar -----
exports.deleteAvatar = async (publicId) => {
    try {
        if (!publicId) {
            return ;
        }
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Erreur suppression Cloudinary :', error);
        throw new Error('Erreur lors de la suppression de l\'avatar');
    }
};

// ---- modifier Avatar -----
exports.modifyAvatar = async (oldPublicId, newFile) => {
    try {
        // Supprimer l'ancien avatar
        if (oldPublicId) {
            await exports.deleteAvatar(oldPublicId);
        }

        // Uploader le nouveau avatar
        return await exports.uploadAvatar(newFile);

    } catch (error) {
        console.error('Erreur modification Cloudinary :', error);
        throw new Error('Erreur lors de la modification de l\'avatar');
    }
};

module.exports = exports;