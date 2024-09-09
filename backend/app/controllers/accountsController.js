import AccountModel from "../models/accountModel.js";
import CreditCardModel from "../models/productModel.js";
import MeetingPlannerModel from "../models/meetingModel.js";
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRANSFER_MAX_LIMIT = 3000.00;
const TRANSACTIONS_PER_PAGE = 5;
const DATE_TIME = new RegExp('^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])T(?:[01][0-9]|2[0-3]):[0-5][0-9]$')
const FILENAME = new RegExp('^[a-zA-Z0-9._-]{5,256}$')
const VALID_DOMAIN = new RegExp('^https://drive.google.com/')

// Return the basic account details
const getAccounts = (req, res) => {

    return res.status(200).json({
        "accountId": req.account._id,
        "name": req.account.name,
        "email": req.account.email,
        "address": req.account.postalAddress
    })
}

// Delete the account
const deleteAccount = async (req, res) => {

    try {

        const deleted = await AccountModel.findByIdAndDelete(req.account._id);

        if (!deleted) {
            return res.status(500).json({ "message": "unexpected error" })
        }

        res.status(200).json({ "message": "account deleted." })

    } catch (err) {

        console.log("Catching error in deleteAccount: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

const updateAccountOptions = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    // BUG: OWASP API-3 (BOPLA / mass assignment)
    // Description: Allows changes to account options that should not be updated by the client.
    // Solution: 
    // const options = {
    //     paperStatements: req.body.paperStatements,
    //     cardActivityAlerts: req.body.cardActivityAlerts,
    //     smsNotifications: req.body.smsNotifications
    // }

    const options = { ...req.body };

    if ((options.paperStatements && typeof options.paperStatements !== 'boolean') ||
        (options.cardActivityAlerts && typeof options.cardActivityAlerts !== 'boolean') ||
        (options.smsNotifications && typeof options.smsNotifications !== 'boolean')) {
        return res.status(400).json({ "message": "invalid input" });
    }

    try {
        const doc = await AccountModel.findOneAndUpdate(req.account._id, { options }, { returnOriginal: false });
        if (!doc) {
            return res.status(500).json({ "message": "unexpected error" })
        }

        // BUG: OWASP API-3 (BOPLA / excessive data exposure)
        // Description: not defining and enforcing the properties returned by the API
        // Solution:
        // return res.status(200).json({
        //   paperStatements: doc.options.paperStatements,
        //   cardActivityAlerts: doc.options.cardActivityAlerts,
        //   smsNotifications: doc.options.smsNotifications
        // })
        return res.status(200).json(doc.options)

    } catch (err) {

        console.log("Catching error in updateAccountOptions: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

// Get the current bank balance
const getBalance = (req, res) => {

    return res.status(200).json({
        "accountId": req.account._id,
        "currency": req.account.currency,
        "balance": req.account.balance,
        "overdraft": req.account.options.accountType === "Business" ? 5000 : 500
    })
}

// Get the list of registered payee's for the account
const getPayeeList = (req, res) => {

    let payeeList = req.account.payees.map(payee => {

        if (payee.payeeType === 'utility') {
            return {
                "name": payee.name,
                "accountNumber": payee.account,
                "payeeType": payee.payeeType,
                "payeeId": payee._id
            }
        }
        else {
            return {
                "name": payee.name,
                "iban": payee.account,
                "payeeType": payee.payeeType,
                "payeeId": payee._id
            }
        }
    })

    return res.status(200).json(payeeList);
}

// Register a payee for the account. Can be for a contact or utility payee
const createPayee = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { payeeType, name, accountNumber, iban } = req.body;

    if (!payeeType || !name) {
        return res.status(400).json({ "message": "missing required field" });
    }

    if (typeof payeeType !== "string" || typeof name != "string") {
        return res.status(400).json({ "message": "invalid input" });
    }

    payeeType.toLowerCase();

    if ((payeeType === "utility" && !accountNumber) ||
        (payeeType === "contact" && !iban)) {
        return res.status(400).json({ "message": "missing required fields" });
    }

    if ((accountNumber && typeof accountNumber !== "string") ||
        (iban && typeof iban !== "string")) {
        return res.status(400).json({ "message": "invalid input" });
    }

    let findAccount = await AccountModel.findById(req.account._id);

    findAccount.payees.push({
        name,
        payeeType,
        account: payeeType === 'utility' ? accountNumber : iban
    });

    try {
        await findAccount.save();

        const newId = findAccount.payees[findAccount.payees.length - 1]._id;

        return res.status(200).json(
            {
                "message": "new payee added",
                "payeeId": newId
            }
        )

    } catch (err) {
        console.log("Catching createPayee error: ", err.message);
        return res.status(500).json({ "message": "unexpected error." })
    }
}

// Remove a registered payee from the account
const deletePayee = async (req, res) => {

    const payeeId = req.params.PayeeId;

    if (!req.account.payees.id(payeeId)) {
        return res.status(404).json({ "message": "payee not found" });
    }

    try {
        let removePayee = await AccountModel.findOneAndUpdate(
            { _id: req.account._id },
            { $pull: { payees: { _id: payeeId } } },
            { new: true }
        )
    } catch (err) {
        console.log("Catching error in deletePayee: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }

    return res.status(200).json({ "message": "payee removed." })
}

// initiate a transfer to a contact
const createTransferPayment = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { accountId, name, iban, amount, currency, description } = req.body;

    if (!accountId || !iban || !amount || !currency) {
        return res.status(400).json({ "message": "missing a required field" });
    }

    if (typeof iban !== "string" || typeof amount !== "number" || amount < 0 || typeof currency != "string") {
        return res.status(400).json({ "message": "invalid input" });
    }

    // BUG: API-8:2019 (Injection)
    // Description: user input for accountId is vulnerable to nosql injection
    // Solution: 
    // if( typeof accountId !== "string" || accountId !== req.account._id ) {
    //     return res.status(400).json({ "message": "invalid input" });
    // }

    if (currency.toUpperCase() != "EUR" && currency.toUpperCase() != "GBP") {
        return res.status(400).json({ "message": "invalid currency" });
    }

    const overdraftLimit = req.account.options.accountType === "Business" ? 5000 : 500;

    if (amount > req.account.balance + overdraftLimit) {
        return res.status(400).json({ "message": "payment failed as it would exceed your overdraft limit." });
    }

    try {
        // const account = await AccountModel.findById(req.account._id);
        const account = await AccountModel.findById(accountId);

        account.balance -= amount;

        account.transactions.push({
            "txnId": crypto.randomUUID(),
            "txnType": "funds transfer",
            "txnDir": "debit",
            name,
            iban,
            amount,
            currency,
            description
        })

        await account.save();

        return res.status(200).json({
            "message": "payment successful",
            "transactionId": account.transactions[account.transactions.length - 1].txnId
        })
    }
    catch (err) {
        console.log("Catching error in createPayment: ", err.message);

        return res.status(500).json({ "message": "unexpected error" });
    }

}

// initiate a bill payment to a utility account
const createBillPayment = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { name, accountNumber, amount, currency } = req.body;

    if (!name || !accountNumber || (amount !== 0 && !amount)) {
        return res.status(400).json({ "message": "missing a required field" });
    }

    if (typeof name !== "string" || typeof accountNumber !== "string" || typeof amount != "number") {
        return res.status(400).json({ "message": "invalid input" });
    }

    // BUG: Input Validation
    // Description: amount can be negative, thereby increasing the balance
    // Solution: 
    // if(amount < 0 || amount > TRANSFER_MAX_LIMIT) {
    if (amount > TRANSFER_MAX_LIMIT) {
        return res.status(400).json({ "message": "invalid amount" });
    }

    if (currency && (typeof currency !== "string" || (currency.toUpperCase() != req.account.currency))) {
        return res.status(400).json({ "message": "invalid currency" });
    }

    const overdraftLimit = req.account.options.accountType === "Business" ? 5000 : 500;

    if (amount > req.account.balance + overdraftLimit) {
        return res.status(400).json({ "message": "payment failed as it would exceed your overdraft limit." });
    }

    try {
        const account = await AccountModel.findById(req.account._id);

        account.balance -= amount;

        account.transactions.push({
            "txnId": crypto.randomUUID(),
            "txnType": "bill payment",
            name,
            accountNumber,
            amount,
            "currency": currency ? currency : req.account.currency
        })

        await account.save();

        return res.status(200).json({
            "message": "payment successful",
            "transactionId": account.transactions[account.transactions.length - 1].txnId
        })
    }
    catch (err) {
        console.log("Catching error in createPayment: ", err.message);

        return res.status(500).json({ "message": "unexpected error" });
    }

}

// Get a list of payment transactions
const getTransactionList = async (req, res) => {

    // BUG: API-4 (Unrestricted Resource Consumption)
    // Description: No constraints on the number of records to return
    // Solution:
    // return res.status(200).json(req.account.transactions.slice(-TRANSACTIONS_PER_PAGE))

    return res.status(200).json(req.account.transactions);
}

// Get a list of payment transactions
const getTransactionListHeaders = (req, res) => {

    return res.status(200).send();
}

// Request a new credit card
const createCardApplication = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { delivery } = req.body;

    // check for required input
    if (!delivery) {
        return res.status(400).json({ "message": "missing required field" })
    }

    // validate input
    if (!['post', 'collect'].includes(delivery)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    // check if user already has a credit card or pending application
    if (req.account.products.find((product) => product.type === "creditCard" && product.status !== "cancelled")) {
        return res.status(409).json({ "message": "cannot apply for multiple credit cards." })
    }

    let newRecord = {
        _id: 1000 + await CreditCardModel.countDocuments(),
        name: req.account.name,
        delivery: delivery,
        address: delivery === 'post' ? req.account.postalAddress : undefined
    }

    try {

        // update credit card database collection
        await CreditCardModel.create(newRecord);

        let findAccount = await AccountModel.findById(req.account._id);

        findAccount.products.push({
            type: "creditCard",
            referenceId: newRecord._id
        });

        // update user account
        await findAccount.save();

        return res.status(200).json({
            "message": "success",
            "referenceId": newRecord._id
        })

    } catch (err) {
        console.log("Catching error in createCardApplication: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

// Get the status of an existing credit card application
const getCardApplication = async (req, res) => {

    const findCreditCard = req.account.products.find(product => product.type === "creditCard")

    if (!findCreditCard) {
        return res.status(404).json({ "message": "card application not found" })
    }

    try {
        const doc = await CreditCardModel.findOne({ _id: findCreditCard.referenceId }).select("-__v");

        if (doc) {
            res.status(200).json(doc);
        }
        else {
            res.status(500).json({ "message": "unexpected error" })
        }
    } catch (err) {
        console.log("Catching error in getCardApplication: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

// Modify an existing credit card application
const modifyCardApplication = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { referenceId } = req.params;
    const { delivery, postalAddress } = req.body;

    if ((delivery && !['post', 'collect'].includes(delivery)) ||
        (postalAddress && typeof postalAddress != "object")) {
        return res.status(400).json({ "message": "invalid input" });
    }

    let findRecord;

    try {
        // BUG: OWASP API-1 (BOLA)
        // Description: verify if the record to be modified, identified by 'referencedId', is associated with the authenticated users account
        // Solution:
        // if (!req.account.products.find(product => product.referenceId == referenceId)) {
        //    return res.status(404).json({ "message": "card application not found" })
        // }

        findRecord = await CreditCardModel.findOne({ _id: referenceId })
    } catch (err) {
        console.log("Catching error in modifyCardApplication: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }

    if (!findRecord) {
        return res.status(404).json({ "message": "not found" })
    }
    else if (findRecord.status !== "pending") {
        return res.status(409).json({ "message": `card status is: ${findRecord.status}` })
    }

    let updateRecord;

    switch (req.body.delivery) {
        case 'collect':
            req.body.postalAddress = {};
            break;
        case 'post':
            if (!req.body.postalAddress) {
                req.body.postAddress = findRecord.address;
            }
            break;
        case undefined:
            if (req.body.postalAddress) {
                if (findRecord.delivery === 'collect') {
                    return res.status(409).json({ "message": "cannot modify delivery address when delivey method is collect" })
                }
            }
            else {
                return res.status(400).json({ "message": "invalid request" })
            }
            break;
        default:
            return res.status(400).json({ "message": "invalid request" })
            break;
    }

    try {
        updateRecord = await CreditCardModel.findOneAndUpdate(
            { _id: referenceId },
            {
                $set: {
                    delivery: req.body.delivery,
                    address: req.body.postalAddress
                }
            },
            {
                "returnDocument": "after"
            },

        ).select("-__v");

    } catch (err) {
        console.log("Catching error in modifyCardApplication: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }

    return res.status(200).json(updateRecord)
}

// Delete an existing credit card application
const deleteCardApplication = async (req, res) => {

    const { referenceId } = req.params;

    if (!req.account.products.find(product => product.referenceId == referenceId)) {
        return res.status(404).json({ "message": "card application not found" })
    }

    try {
        await AccountModel.findOneAndUpdate(
            { _id: req.account._id },
            { $pull: { products: { referenceId: referenceId } } },
        )

        await CreditCardModel.findOneAndUpdate(
            { _id: referenceId },
            { $set: { status: "cancelled" } },
        )

    } catch (err) {
        console.log("Catching error in deleteCardApplication: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }

    return res.status(200).json({ "message": "credit card application cancelled." })
}

const createMeeting = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { schedule } = req.body;

    if (!schedule || typeof schedule !== "string" || !DATE_TIME.test(schedule)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    try {

        const doc = await MeetingPlannerModel.findOne({ schedule }).select("-__v");

        if (doc) {
            return res.status(409).json({ "message": "the requested time slot is not available." });
        }
        else {

            // BUG: OWASP API-6 (Unrestricted Access to Sensitive Business Flows)
            // Description: A user can book all available timeslots of mortgage advisors
            // Solution: 
            // const doc = await MeetingPlannerModel.findOne({ "accountId": req.account._id }).select("-__v");
            // if (doc) {
            //     return res.status(403).json({"message": "you cannot reserve more than one mortgage consultation"});
            // }

            await MeetingPlannerModel.create(
                {
                    "schedule": schedule,
                    "accountId": req.account._id,
                }
            );
            return res.status(201).json({ "message": "appointment with mortgage advisor is reserved." })
        }
    } catch (err) {
        console.log("Catching error in createMeeting: ", err.message);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

const createFile = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { url } = req.body;

    if (!url || (typeof url !== "string")) {
        return res.status(400).json({ "message": "invalid input" });
    }

    // BUG: OWASP API-7  (Server-side Request Forgery)
    // Description: the url input is vulnerable to SSRF
    // Solution: 
    // if(!VALID_DOMAIN.test(url)) {
    //     return res.status(400).json({ "message": "invalid input" });
    // }

    const fileName = path.basename(url); // get the file name from the URL
    const outputPath = path.resolve(__dirname, 'downloads', fileName);

    try {
        // Create the downloads folder if it doesn't exist
        if (!fs.existsSync(path.resolve(__dirname, 'downloads'))) {
            fs.mkdirSync(path.resolve(__dirname, 'downloads'));
        }

        await downloadFile(url, outputPath);

        res.status(200).json({ "message": `File downloaded and saved to ${outputPath}` });

    } catch (err) {

        if(err.response) {
            res.status(err.response.status).json({ "message": `Error downloading the file: ${err.response.message}`})
        }
        else {
            res.status(500).json({ "message": `Error downloading the file: ${err.code}`})
        }
    }
}

const getFile = async (req, res) => {

    const uploadDir = path.join(__dirname, 'downloads'); // Directory where files are stored

    // Route for file download (vulnerable to path traversal)
    const filename = req.query.filename;
    const filePath = path.join(uploadDir, filename);

    // BUG: OWASP A01:2021  (Broken Access Control)
    // Description: the filename input is vulnerable to path traversal attacks
    // Solution: 
    // if (!FILENAME.test(filename)) {
    //     return res.status(400).json({ "message": "invalid input" });
    // }

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err) {
            return res.status(404).json({ "message": "File not found. " });
        }

        // Send the file without validating or sanitizing the input
        res.download(filePath, (downloadErr) => {
            if (downloadErr) {
                res.status(500).json({ "message": "Error downloading the file." });
            }
        });
    });
}

// Helper function to download and store an external file
const downloadFile = async (fileUrl, outputLocationPath) => {

    const writer = fs.createWriteStream(outputLocationPath);

    const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};



export {
    getAccounts,
    deleteAccount,
    updateAccountOptions,
    getBalance,
    getPayeeList,
    createPayee,
    deletePayee,
    createTransferPayment,
    createBillPayment,
    getTransactionList,
    getTransactionListHeaders,
    createCardApplication,
    getCardApplication,
    modifyCardApplication,
    deleteCardApplication,
    createMeeting,
    createFile,
    getFile
}