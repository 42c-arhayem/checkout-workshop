import jwt from 'jsonwebtoken';
import AccountModel from '../models/accountModel.js';

// Register a new user Account
const accountRegistration = async (req, res) => {

    const { name, email, postalAddress, pan, accountType } = req.body;

    if(!name || !email || !postalAddress || !pan || !accountType ) {
        return res.status(400).json({ "message": "missing required field" });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof pan !== "string" || typeof accountType != "string" || typeof postalAddress != "object") {
        return res.status(400).json({ "message": "invalid input" });
    }

    if(!postalAddress.country) {
        return res.status(400).json({ "message": "missing required field" });
    }

    // BUG: OWASP A01 (Broken Access Control)
    // Description: Allows user to register with privileged account type.
    // Solution: 
    // const allowedAccountTypes = ['personal'];
    // if (!allowedAccountTypes.includes(accountType))
    // {
    //     return res.status(400).json({ "message": "invalid input" });
    // }

    try {
        let account = await AccountModel.findOne({ email });

        if (account) {
            return res.status(409).json({ "message": "User already exists." });
        }

        account = await AccountModel.create(
            { 
                name, 
                email, 
                postalAddress, 
                pan, 
                currency: postalAddress.country.toUpperCase() === 'UK' ? "GBP" : "EUR",
                options: { accountType } 
            }
        )

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

    const { email, pan } = req.body;

    if (typeof email !== "string" || typeof pan !== "string") {
        return res.status(400).json({ "message": "invalid input" });
    }

    // BUG: OWASP API-2 (Broken AuthN)
    // Description: protect the validatePan hashing function from long password DOS
    // Solution: 
    // if(pan.length > 5) {
    //  return res.status(400).json({ "message": "invalid input" });
    //}

    try {
        const account = await AccountModel.findOne({ email });

        if (account === null) {
            return res.status(404).json({ "message": "invalid account" })
        }

        if (!(await account.validatePan(pan))) {
            // BUG: OWASP API-3 (BOPLA)
            // Description a user should not have direct access to the hashed pan value
            // Solution: remove the "secret" property in the returned object below

            return res.status(401).json({ "message": "invalid credentials", "secret": account.pan })
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