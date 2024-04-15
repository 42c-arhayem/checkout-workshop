import jwt from 'jsonwebtoken';
import AccountModel from '../models/accountModel.js';

// Register a new user Account
const accountRegistration = async (req, res) => {

    const { name, email, postalAddress, pan } = req.body;

    let account = await AccountModel.findOne({ email });

    if (account) {
        return res.status(400).json({ "message": "User already exists." })
    }

    account = await AccountModel.create({ name, email, postalAddress, pan })

    if (account) {
        res.status(201).json({ "AccountId": account._id });
    }
    else {
        res.status(400).json({ "message": "invalid request" })
    }
}

// Login to a user account
const accountLogin = async (req, res) => {

    const { email, pan } = req.body;

    const account = await AccountModel.findOne({ email });

    if (account === null) {
        return res.status(404).json({ "message": "invalid account" })
    }

    // const validated = await validatePan(pan, account.pan);
    if(! (await account.validatePan(pan))) {
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
export {
    accountRegistration,
    accountLogin
}