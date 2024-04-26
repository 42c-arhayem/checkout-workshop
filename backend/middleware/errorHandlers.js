// error handler to catch calls to undefined endpoints
const handleMethodNotAllowed = (req, res, next) => {

    const err = new Error(`Invalid operation ${req.method} ${req.originalUrl}`);
    res.status(405);
    next(err);
}

// error handler to catch calls to undefined endpoints
const handleRouteNotFound = (req, res, next) => {

    const err = new Error(`Not found: ${req.originalUrl}`)
    res.status(404);
    next(err);
}

// custom error handler to control the error messages and status returned to the client
const handleError = (error, req, res, next) => {

    let code = error.status ? error.status : res.statusCode < 400 ? 500 : res.statusCode
    let msg = error.message;

    res.status(code).json({ "message": msg });
}

export {
    handleMethodNotAllowed,
    handleRouteNotFound, 
    handleError
};

