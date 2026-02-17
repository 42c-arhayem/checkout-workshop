import AccountModel from '../../app/models/accountModel.js';
import crypto from 'crypto';

const TRANSFER_MAX_LIMIT = 3000.00;
const ACCOUNTID = new RegExp('^[a-f\\d]{24}$');

const paymentResolvers = {
  Query: {
    // Get the list of registered payee's for the account
    getPayeeList: (_, __, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      let payeeList = account.payees.map(payee => {
        if (payee.payeeType === 'utility') {
          return {
            name: payee.name,
            accountNumber: payee.account,
            payeeType: payee.payeeType,
            payeeId: payee._id.toString()
          };
        } else {
          return {
            name: payee.name,
            iban: payee.account,
            payeeType: payee.payeeType,
            payeeId: payee._id.toString()
          };
        }
      });

      return payeeList;
    },

    // Get a list of payment transactions
    getTransactionList: (_, __, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      // BUG: API-4 (Unrestricted Resource Consumption)
      // Description: No constraints on the number of records to return
      // Solution:
      // const TRANSACTIONS_PER_PAGE = 5;
      // return account.transactions.slice(-TRANSACTIONS_PER_PAGE);

      return account.transactions;
    }
  },

  Mutation: {
    // Register a payee for the account. Can be for a contact or utility payee
    createPayee: async (_, { input }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      const { payeeType, name, accountNumber, iban } = input;

      if (!payeeType || !name) {
        throw new Error("missing required field");
      }

      if (typeof payeeType !== "string" || typeof name !== "string") {
        throw new Error("invalid input");
      }

      const normalizedPayeeType = payeeType.toLowerCase();

      if ((normalizedPayeeType === "utility" && !accountNumber) ||
        (normalizedPayeeType === "contact" && !iban)) {
        throw new Error("missing required fields");
      }

      if ((accountNumber && typeof accountNumber !== "string") ||
        (iban && typeof iban !== "string")) {
        throw new Error("invalid input");
      }

      let findAccount = await AccountModel.findById(account._id);

      findAccount.payees.push({
        name,
        payeeType: normalizedPayeeType,
        account: normalizedPayeeType === 'utility' ? accountNumber : iban
      });

      try {
        await findAccount.save();

        const newId = findAccount.payees[findAccount.payees.length - 1]._id;

        return {
          message: "new payee added",
          payeeId: newId.toString()
        };
      } catch (err) {
        console.log("Catching createPayee error: ", err.message);
        throw new Error("unexpected error.");
      }
    },

    // Remove a registered payee from the account
    deletePayee: async (_, { payeeId }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      if (!account.payees.id(payeeId)) {
        throw new Error("payee not found");
      }

      try {
        await AccountModel.findOneAndUpdate(
          { _id: account._id },
          { $pull: { payees: { _id: payeeId } } },
          { new: true }
        );

        return { message: "payee removed." };
      } catch (err) {
        console.log("Catching error in deletePayee: ", err.message);
        throw new Error("unexpected error");
      }
    },

    // Initiate a transfer to a contact
    createTransferPayment: async (_, { input }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      const { sourceAccountId, name, iban, amount, currency, description } = input;

      if (!sourceAccountId || !iban || !amount || !currency) {
        throw new Error("missing a required field");
      }

      if (typeof iban !== "string" || typeof amount !== "number" || amount < 0 || typeof currency !== "string") {
        throw new Error("invalid input");
      }

      // BUG: API-8:2019 (Injection)
      // Description: user input for accountId is vulnerable to nosql injection
      // Solution: 
      // if( typeof sourceAccountId !== "string" || (!ACCOUNTID.test(sourceAccountId))) {
      //     throw new Error("invalid input");
      // }

      if (currency.toUpperCase() !== "EUR" && currency.toUpperCase() !== "GBP") {
        throw new Error("invalid currency");
      }

      const overdraftLimit = account.options.accountType === "business" ? 10000 : 500;

      if (amount > account.balance + overdraftLimit) {
        throw new Error("payment failed as it would exceed your overdraft limit.");
      }

      try {
        const sourceAccount = await AccountModel.findById(sourceAccountId);

        if (!sourceAccount) {
          throw new Error(`Cannot find source account: ${sourceAccountId}`);
        }

        sourceAccount.balance -= amount;

        sourceAccount.transactions.push({
          txnId: crypto.randomUUID(),
          txnType: "funds transfer",
          txnDir: "debit",
          name,
          iban,
          amount,
          currency,
          description
        });

        await sourceAccount.save();

        return {
          message: "payment successful",
          transactionId: sourceAccount.transactions[sourceAccount.transactions.length - 1].txnId
        };
      } catch (err) {
        console.log("Catching error in createTransferPayment: ", err.message);
        throw new Error(err.message || "unexpected error");
      }
    },

    // Initiate a bill payment to a utility account
    createBillPayment: async (_, { input }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      const { name, accountNumber, amount, currency } = input;

      if (!name || !accountNumber || (amount !== 0 && !amount)) {
        throw new Error("missing a required field");
      }

      if (typeof name !== "string" || typeof accountNumber !== "string" || typeof amount !== "number") {
        throw new Error("invalid input");
      }

      // BUG: Input Validation
      // Description: amount can be negative, thereby increasing the balance
      // Solution: 
      // if(amount < 0 || amount > TRANSFER_MAX_LIMIT) {
      // if (amount > TRANSFER_MAX_LIMIT) {
      //     throw new Error("invalid amount");
      // }

      if (currency && (typeof currency !== "string" || (currency.toUpperCase() !== account.currency))) {
        throw new Error("invalid currency");
      }

      const overdraftLimit = account.options.accountType === "business" ? 10000 : 500;

      if (amount > account.balance + overdraftLimit) {
        throw new Error("payment failed as it would exceed your overdraft limit.");
      }

      try {
        const userAccount = await AccountModel.findById(account._id);

        userAccount.balance -= amount;

        userAccount.transactions.push({
          txnId: crypto.randomUUID(),
          txnType: "bill payment",
          name,
          accountNumber,
          amount,
          currency: currency ? currency : account.currency
        });

        await userAccount.save();

        return {
          message: "payment successful",
          transactionId: userAccount.transactions[userAccount.transactions.length - 1].txnId
        };
      } catch (err) {
        console.log("Catching error in createBillPayment: ", err.message);
        throw new Error("unexpected error");
      }
    }
  }
};

export default paymentResolvers;
