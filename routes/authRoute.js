const router = require('express').Router();
const photoUpload = require('../middlewares/uploadPhoto/uploadPhoto');
const { RegisterUser, login } = require('../services/userServices');


router.post('/register', photoUpload.single('image'), RegisterUser);
router.post('/login', login);
module.exports = router;