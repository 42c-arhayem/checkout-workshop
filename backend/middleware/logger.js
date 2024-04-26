const logRequest = (req, res, next) => {

    console.log(`New Request: ${req.method} ${req.originalUrl}`);
    if(req.body) {
        console.log(req.body);
    }
    next();
}

export { logRequest };