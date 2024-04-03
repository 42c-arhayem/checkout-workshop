import jwt from 'jsonwebtoken';
import AccountModel from '../models/accountModel.js';

const createToken = async (req, res) => {

    const { email, pin } = req.body;

    const account = await AccountModel.findOne({ email });

    if (account === null) {
        return res.status(404).json({ "message": "invalid account" })
    }

    // const validated = await validatePin(pin, account.pin);
    if(! (await account.validatePin(pin))) {
        return res.status(401).json({ "message": "invalid credentials" })
    }

    const token = jwt.sign(
        { accountId: account._id },
        process.env.TOKEN_USER_ACCESS_SECRET,
        { expiresIn: parseInt(process.env.TOKEN_USER_ACCESS_EXPIRY) }
    )

    return res.status(200).json({ 
        "access": token,
        "access_expires": parseInt(process.env.TOKEN_USER_ACCESS_EXPIRY)
    })

}
const refreshToken = (req, res) => {
    res.send("received /token/refresh")
}

export {
    createToken,
    refreshToken
}