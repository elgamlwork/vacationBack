const foundError = (req, res, next) => {
    const error = new Error({ message: `Not found ${req.originalUrl}` });
    res.status(404);
    next(error);
};


const handleError = (error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({ message: error.message,stack:process.env.NODE_EVN === "production" ? null : error.stack });
}

module.exports = { handleError, foundError};

