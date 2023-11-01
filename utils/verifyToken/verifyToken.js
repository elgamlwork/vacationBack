const JWT = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const BearerToken = req.headers.authorization;
    if (BearerToken) {
        const token = BearerToken.split(' ')[1];
        try {
            const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
            req.user = decodedToken;
            next();
        } catch (error) {
            return res.status(401).json({ message: "You don't access" });
        }
    } else {
        return res.status(404).json({ message: "Invaild token" });
    }
    
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "Not allow, only admin" });
        }
    })
}
const verifyTokenAndOnlyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "You can't access of this profile" });
        }
    })
}

module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
}
    