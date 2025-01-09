const validateInput = (req, res, next) => {

  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    
    if (!req.is('application/json')) {
      return res.status(415).json({ "message": "invalid content type" })
    }
  }
  next();
}

export { validateInput };