import AccountModel from "../models/accountModel.js";
import mongoose, {Types} from "mongoose";

// Create a new User Account
const createAccount = async (req, res) => {

    const { name, email, postcode, pin } = req.body;

    let account = await AccountModel.findOne({ email });

    if (account) {
        return res.status(400).json({ "message": "User already exists." })
    }

    account = await AccountModel.create({ name, email, postcode, pin })

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
        "balance": req.account.balance.amount,
        "currency": req.account.balance.currency
    })

}

const getAccount = (req, res) => {

    return res.status(200).json({
        "account ID": req.account._id,
        "balance": req.account.balance.amount,
        "currency": req.account.balance.currency
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
            { new: true}
        )

        console.log ("removePayee: ", removePayee);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "unexpected error" })
    }

    return res.status(200).json( {"message" :"payee removed." } )
}

const createPayment = async (req, res) => {

    const { payeeId, amount, currency } = req.body; 

    const account = await AccountModel.findById(req.account._id);

    if(account.balance.currency.toLowerCase() !== currency.toLowerCase()) {
        return res.status(200).json({"message": "invalid currency"});
    }

    else if(account.balance.amount < amount) {
        return res.status(200).json({"message": "insufficient funds"});
    }

    const findPayee = await account.payees.find( payee => payee._id.toString() == payeeId )

    if(!findPayee) {
        return res.status(400).json({"message": "payee not found"})
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
        "transactionId": account.transactions[account.transactions.length-1]._id
    })


}

const getTransactionList = (req, res) => {
    
    return res.status(200).json(req.account.transactions);
}

const createCardApplication = (req, res) => {
    res.send("received POST /accounts/:AccountId/cards")
}

const getCardApplication = (req, res) => {
    res.send("received GET /accounts/:AccountId/cards/:CardApplicationId")
}

const modifyCardApplication = (req, res) => {
    res.send("received PUT /accounts/:AccountId/cards/:CardApplicationId")
}

const deleteCardApplication = (req, res) => {
    res.send("received DELETE /accounts/:AccountId/cards/:CardApplicationId")
}

export {
    createAccount,
    getAccounts,
    getAccount,
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