const multer = require('multer');
const path = require('path');


const photoStorage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, path.join(__dirname, '../../images/postIamge'));
    },
    filename: (req, file, cd) => {
        if (file) {
         cd(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
        } else {
            cd(null, false);
        }
    }
});

const upload = multer({
    storage: photoStorage,
    fileFilter: (req, file, cd) => {
        if (file.mimetype.startsWith("image") || path.extname(file.originalname) === ".mp4" ) {
            cd(null, true);
        } else {
            cd({ message: "Unspported file format" }, false);
        }
    },
    
    limits: {
        fileSize: 1024 * 1024 * 50 // 10megabyte
    }
})

module.exports = upload;
