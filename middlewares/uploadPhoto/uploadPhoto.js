const path = require('path');

const multer = require('multer');


// photo storage..............................

const photoStorage = multer.diskStorage({
    destination: (req,file,callBackFunction) => {
        callBackFunction(null, path.join(__dirname, '../../images'));
    },
    filename: (req,file,callBackFunction) => {
        if (file) {
            callBackFunction(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
        } else {
            callBackFunction(null, false);
        }
    }
})

// photo upload....................................

const photoUpload = multer({
    storage: photoStorage,
    fileFilter: (req, file, callBackFunction) => {
        if (file.mimetype.startsWith("image")) {
            callBackFunction(null, true);
        } else {
            callBackFunction({ message: "Unspported file format" }, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 // 1megabyte
    }
});

module.exports = photoUpload;