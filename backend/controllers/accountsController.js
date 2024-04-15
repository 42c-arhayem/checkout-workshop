import AccountModel from "../models/accountModel.js";
import CreditCardModel from "../models/productModel.js";


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

        console.log(err);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

// Get the current bank balance
const getBalance = (req, res) => {
    return res.status(200).json({
        "account ID": req.account._id,
        "balance": req.account.balance.amount,
        "currency": req.account.balance.currency
    })
}

// Get the list of registered payee's for the account
const getPayeeList = (req, res) => {

    return res.status(200).json(req.account.payees);
}

// Register a payee for the account
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

// Remove a registered payee from the account
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

// initiate a payment to a payee
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

// Get a list of payment transactions
const getTransactionList = (req, res) => {

    return res.status(200).json(req.account.transactions);
}

// 
const createCardApplication = async (req, res) => {

    const { delivery } = req.body;

    const account = await AccountModel.findById(req.account._id);

    // check if the user has already requested a credit card
    const findCreditCard = await account.products.find(product => product.type === "creditCard")

    if (findCreditCard) {
        return res.status(409).json(
            { "message": "credit card application already exists." })
    }

    let ccApplication = {};

    let applicationIndex = await CreditCardModel.countDocuments();

    ccApplication._id = applicationIndex + 1000;
    ccApplication.name = account.name;
    ccApplication.delivery = delivery;

    if (delivery === "post") {
        ccApplication.address = account.postalAddress;
    }

    try {
        // create a credit card application record 
        let newCard = await CreditCardModel.create(ccApplication)

        if (newCard) {

            account.products.push({
                type: "creditCard",
                referenceId: ccApplication._id
            })

            await account.save();

            return res.status(200).json({
                "message": "application received.",
                "referenceId": ccApplication._id,
                "status": ccApplication.status
            })
        }
        else {
            res.status(400).json({ "message": "invalid request" })
        }
    } catch(err) {
        console.log(err);
        return res.status(500).json({ "message": "unexpected error" })
    }
    
}

const getCardApplication = async (req, res) => {

    // SAFE: checks for credit card application associated with the users account.
    const findCreditCard = req.account.products.find(product => product.type === "creditCard")
    
    if (!findCreditCard) {
        return res.status(404).json({ "message": "no card application found" })
    }

    try {
        const ccApplication = await CreditCardModel.findOne({ _id: findCreditCard.referenceId }).select("-__v");

        if (ccApplication) {
            res.status(200).json(ccApplication);
        }
        else {
            res.status(500).json({ "message": "unexpected error" })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "unexpected error" }) 
    }

    
}

const modifyCardApplication = async (req, res) => {

    const { referenceId } = req.params;

    // UNSAFE!: checks global credit card application record by referenceId, instead of checking users account.
    const findRecord = await CreditCardModel.findOne({ _id: referenceId })

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
                    return res.status(409).json({ "message": "card delivey is: collect" })
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
        return res.status(200).json(updateRecord)

    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "unexpected error" })
    }
}

const deleteCardApplication = async (req, res) => {

    const { referenceId } = req.params;

    const findCreditCard = await req.account.products.find(product => product._id == referenceId)

    if (!findCreditCard) {
        return res.status(404).json({ "message": "credit card application not found" })
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
        console.log(err);
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
    createCardApplication,
    getCardApplication,
    modifyCardApplication,
    deleteCardApplication
}