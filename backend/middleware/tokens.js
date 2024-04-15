import jwt from 'jsonwebtoken';
import AccountModel from '../models/accountModel.js';

const createToken = ( accountId ) => {

    return jwt.sign(
        { accountId },
        process.env.TOKEN_USER_ACCESS_SECRET,
        { expiresIn: process.env.TOKEN_USER_ACCESS_EXPIRY }    
    )
}

// Middleware function to authenticate a request
const authenticateToken = async (req, res, next) => {

    const authHeader = req.headers['authorization'];

    // no bearer token
    if(!authHeader || ( authHeader.split(' ')[0].toLowerCase() !== "bearer")) {
        return res.status(401).json({"message": "no access token"})
    }
    
    const token = authHeader.split(' ')[1];

    try {

        const decoded = await jwt.verify(token, process.env.TOKEN_USER_ACCESS_SECRET);

        const findAccount = await AccountModel.findById(decoded.accountId);

        if(!findAccount){
            return res.status(200).json({"message": "invalid account"});
        }

        req.account = findAccount;

        next();

    } catch (err) {
        if(err.name === "TokenExpiredError") {
            return res.status(401).json({"message": "access token expired"})
        }

        console.log(err)
        return res.status(401).json({"message": "invalid access token TEST"})
    }
}

export {
    createToken,
    authenticateToken
}