import jwt from 'jsonwebtoken';
import AccountModel from '../models/accountModel.js';

// Register a new user Account
const accountRegistration = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { name, email, postalAddress, pan } = req.body;

    if (typeof name !== "string" || typeof email !== "string" || typeof pan !== "string" ||
        (postalAddress && typeof postalAddress != "object")) {
        return res.status(400).json({ "message": "invalid input" });
    }

    try {
        let account = await AccountModel.findOne({ email });

        if (account) {
            return res.status(400).json({ "message": "User already exists." });
        }

        account = await AccountModel.create({ name, email, postalAddress, pan })

        if (account) {
            return res.status(201).json(
                { 
                    "message": "registration success",
                    "accountId": account._id 
                }
            );
        }
        else {
            return res.status(400).json({ "message": "invalid request" })
        }
    }
    catch (err) {
        console.log("Catching error in accountRegistration: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }


}

// Login to a user account
const accountLogin = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { email, pan } = req.body;

    if (typeof email !== "string" || typeof pan !== "string") {
        return res.status(400).json({ "message": "invalid input" });
    }

    try {
        const account = await AccountModel.findOne({ email });

        if (account === null) {
            return res.status(404).json({ "message": "invalid account" })
        }

        if (!(await account.validatePan(pan))) {
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
    } catch (err) {
        console.log("Catching error in accountLogin: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }

}
export {
    accountRegistration,
    accountLogin
}