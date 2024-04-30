import AccountModel from "../models/accountModel.js";
import CreditCardModel from "../models/productModel.js";
import crypto from 'crypto';


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

// Get the current bank balance
const getBalance = (req, res) => {
    return res.status(200).json({
        "accountId": req.account._id,
        "balance": req.account.balance.amount,
        "currency": req.account.balance.currency,
        "secret": req.account.pan
    })
}

// Get the list of registered payee's for the account
const getPayeeList = (req, res) => {

    return res.status(200).json(req.account.payees);
}

// Register a payee for the account. Can be for a contact or utility payee
const createPayee = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }
    const { payeeType, name, accountNumber, utility, iban } = req.body;


    if (typeof payeeType !== "string" || typeof name != "string") {
        return res.status(400).json({ "message": "missing required fields" });
    }

    payeeType.toLowerCase();

    if ((payeeType === "utility" && (typeof accountNumber !== "string" || typeof utility !== "string")) ||
        (payeeType === "contact" && typeof iban !== "string")) {
        return res.status(400).json({ "message": "invalid input" });
    }

    let newPayee = {};
    newPayee.name = name;

    if (payeeType === "utility") {
        newPayee.account = accountNumber;
        newPayee.utility = utility;
    }
    else if (payeeType === "contact") {
        newPayee.iban = iban;
    }
    else {
        return res.status(400).json({ "message": "invalid input" });
    }

    let findAccount = await AccountModel.findById(req.account._id);

    findAccount.payees.push(newPayee);

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

// initiate a payment to a payee
const createPayment = async (req, res) => {

    // input validation
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ "message": "invalid input" });
    }

    const { payeeId, amount, currency } = req.body;

    if (!payeeId || !amount || !currency) {
        return res.status(400).json({ "message": "missing a required field" });
    }

    if (typeof payeeId !== "string" || typeof amount !== "number" || typeof currency != "string") {
        return res.status(400).json({ "message": "invalid input" });
    }

    if (!req.account.payees.id(payeeId)) {
        return res.status(404).json({ "message": "payee not found" });
    }

    if (currency.toUpperCase() != req.account.balance.currency) {
        return res.status(400).json({ "message": "invalid currency" });
    }

    if (amount > req.account.balance.amount) {
        return res.status(400).json({ "message": "insufficient funds" });
    }

    try {
        const account = await AccountModel.findById(req.account._id);

        account.balance.amount -= amount;

        account.transactions.push({
            txnId: crypto.randomUUID(),
            payer: account._id,
            payee: payeeId,
            amount,
            currency
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

    const list = req.account.transactions
        .map((transaction) => ({
            'payer': transaction.payer,
            'payee': transaction.payee,
            'amount': transaction.amount,
            'currency': transaction.currency
        }))

        console.log(list);

    return res.status(200).json(list);
}

// Get a list of payment transactions
const getTransactionListHeaders = (req, res) => {

    return res.status(200).send();
}

// 
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
        // UNSAFE!: checks global credit card application record by referenceId, instead of checking users account.
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

export {
    getAccounts,
    deleteAccount,
    getBalance,
    getPayeeList,
    createPayee,
    deletePayee,
    createPayment,
    getTransactionList,
    getTransactionListHeaders,
    createCardApplication,
    getCardApplication,
    modifyCardApplication,
    deleteCardApplication
}