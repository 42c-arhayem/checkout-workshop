import AccountModel from "../models/accountModel.js";
import { CreditCardModel } from "../models/productModel.js";
import mongoose, { Types } from "mongoose";

// Create a new User Account
const createAccount = async (req, res) => {

    const { name, email, postalAddress, pin } = req.body;

    let account = await AccountModel.findOne({ email });

    if (account) {
        return res.status(400).json({ "message": "User already exists." })
    }

    account = await AccountModel.create({ name, email, postalAddress, pin })

    if (account) {
        res.status(201).json({ "AccountId": account._id });
    }
    else {
        res.status(400).json({ "message": "invalid request" })
    }
}

// Return a list of accounts for the requesting user
const getAccounts = (req, res) => {

    return res.status(200).json({
        "accountId": req.account._id,
        "name": req.account.name,
        "email": req.account.email,
        "address": req.account.postalAddress
    })

}

const deleteAccount = async (req, res) => {

    try {

        const deleted = await AccountModel.findByIdAndDelete(req.account._id);

        if (!deleted) {
            return res.status(500).json({ "message": "unexpected error" })
        }

        res.status(200).json({ "message": "account deleted." })

    } catch (err) {

        console.log(err);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

const getBalance = (req, res) => {
    return res.status(200).json({
        "account ID": req.account._id,
        "balance": req.account.balance.amount,
        "currency": req.account.balance.currency
    })
}

const getPayeeList = (req, res) => {

    return res.status(200).json(req.account.payees);
}

const createPayee = async (req, res) => {


    const { payeeType } = req.body;

    let newPayee = {};
    newPayee.name = req.body.name;

    if (payeeType.toLowerCase() === "utility") {
        newPayee.account = req.body.accountNumber,
            newPayee.utility = req.body.utility
    }

    else if (payeeType.toLowerCase() === "contact") {
        newPayee.iban = req.body.iban;
    }
    else {
        return res.status(400).json({ "message:": "invalid input" });
    }

    let findAccount = await AccountModel.findById(req.account._id);

    findAccount.payees.push(newPayee);

    try {
        findAccount.save();

        return res.status(200).json({ "message": "new payee successfully added." })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "unexpected error." })
    }
}

const deletePayee = async (req, res) => {

    const payeeId = req.params.PayeeId;

    try {
        let removePayee = await AccountModel.findOneAndUpdate(
            { _id: req.account._id },
            { $pull: { payees: { _id: payeeId } } },
            { new: true }
        )

    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "unexpected error" })
    }

    return res.status(200).json({ "message": "payee removed." })
}

const createPayment = async (req, res) => {

    const { payeeId, amount, currency } = req.body;

    const account = await AccountModel.findById(req.account._id);

    if (account.balance.currency.toLowerCase() !== currency.toLowerCase()) {
        return res.status(200).json({ "message": "invalid currency" });
    }

    else if (account.balance.amount < amount) {
        return res.status(200).json({ "message": "insufficient funds" });
    }

    const findPayee = await account.payees.find(payee => payee._id.toString() == payeeId)

    if (!findPayee) {
        return res.status(400).json({ "message": "payee not found" })
    }

    let newBalance = account.balance.amount - amount;

    account.balance.amount = newBalance;

    account.transactions.push({
        payer: account._id,
        payee: payeeId,
        amount,
        currency
    })

    await account.save();

    return res.status(200).json({
        "message": "payment successful",
        "transactionId": account.transactions[account.transactions.length - 1]._id
    })


}

const getTransactionList = (req, res) => {

    return res.status(200).json(req.account.transactions);
}

const createCardApplication = async (req, res) => {

    const { deliveryMethod } = req.body;

    const account = await AccountModel.findById(req.account._id);

    // check if the user has already requested a credit card
    const findCreditCard = await account.products.find(product => product.productType === "creditCard")

    if (findCreditCard) {
        return res.status(409).json({ "message": "credit card application already exists." })
    }

    let ccApplication = {};

    if (deliveryMethod === "post") {
        // retrieve the users postal address from their registered account
        ccApplication.postalAddress = account.postalAddress;
    }

    ccApplication.deliveryMethod = deliveryMethod

    let applicationIndex = await CreditCardModel.countDocuments();

    ccApplication.applicationId = applicationIndex + 1000;

    // create a credit card application record 
    ccApplication = await CreditCardModel.create(ccApplication)

    if (ccApplication) {

        account.products.push({
            productType: "creditCard",
            applicationId: ccApplication.applicationId
        })

        await account.save();

        return res.status(200).json({
            "message": "credit card application received.",
            "applicationId": ccApplication.applicationId
        })
    }
    else {
        res.status(400).json({ "message": "invalid request" })
    }
}

const getCardApplication = async (req, res) => {

    const findCreditCard = await req.account.products.find(product => product.productType === "creditCard")

    if (!findCreditCard) {
        return res.status(404).json({ "message": "product not found" })
    }

    const ccApplication = await CreditCardModel.find({ applicationId: findCreditCard.applicationId }).select("-_id -__v");

    if (ccApplication) {
        res.status(200).json(ccApplication);
    }
    else {
        res.status(500).json({ "message": "unexpected error" })
    }
}

const modifyCardApplication = async (req, res) => {

    const { ApplicationId } = req.params;

    const findRecord = await CreditCardModel.findOne({ applicationId: ApplicationId })

    if (!findRecord) {
        return res.status(404).json({ "message": "not found" })
    }
    else if (findRecord.applicationStatus !== "pending") {
        return res.status(409).json({ "message": "cannot update this product application." })
    }

    let updateRecord;

    try {
        updateRecord = await CreditCardModel.findOneAndUpdate(
            { applicationId: ApplicationId },
            {
                $set: {
                    deliveryMethod: req.body.deliveryMethod,
                    postalAddress: req.body.postalAddress
                }
            },
            {
                "returnDocument": "after"
            },
            
        ).select("-_id -__v");
        return res.status(200).json(updateRecord)

    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

const deleteCardApplication = async (req, res) => {

    const { ApplicationId } = req.params;

    const findCreditCard = await req.account.products.find(product => product.applicationId == ApplicationId)

    if (!findCreditCard) {
        return res.status(404).json({ "message": "product not found" })
    }

    try {
        await AccountModel.findOneAndUpdate(
            { _id: req.account._id },
            { $pull: { products: { applicationId: ApplicationId } } },
        )

        await CreditCardModel.findOneAndUpdate(
            { applicationId: ApplicationId },
            { $set: { applicationStatus: "cancelled" } },
        )


    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "unexpected error" })
    }

    return res.status(200).json({ "message": "credit card request cancelled." })
}

export {
    createAccount,
    getAccounts,
    deleteAccount,
    getBalance,
    getPayeeList,
    createPayee,
    deletePayee,
    createPayment,
    getTransactionList,
    createCardApplication,
    getCardApplication,
    modifyCardApplication,
    deleteCardApplication
}