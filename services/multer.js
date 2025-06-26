const multer = require("multer")

const mimeType = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'avatar') {
            cb(null, './public/assets/images/avatar'); // Dossier pour les avatars utilisateur
        } else {
            cb(null, './public/assets/images/uploads'); // Dossier pour d'autres fichiers
        }
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1]
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + "." + extension)
    }
})

const upload = multer({
    storage: storage,
   
    fileFilter: function (req, file, cb) {
        if (!mimeType.includes(file.mimetype)) {
            req.multerError = true;
            return cb(null, false);
        }
        cb(null, true);
    }
})

module.exports = upload