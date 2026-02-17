import AccountModel from '../../app/models/accountModel.js';

const accountResolvers = {
  Query: {
    // Return the basic account details
    getAccount: (_, __, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      return {
        accountId: account._id.toString(),
        name: account.name,
        email: account.email,
        address: account.postalAddress
      };
    },

    // Get the current bank balance
    getBalance: (_, __, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      return {
        accountId: account._id.toString(),
        currency: account.currency,
        balance: account.balance,
        overdraft: account.options.accountType === "business" ? 10000 : 500
      };
    }
  },

  Mutation: {
    // Delete the account
    deleteAccount: async (_, __, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      try {
        const deleted = await AccountModel.findByIdAndDelete(account._id);

        if (!deleted) {
          throw new Error("unexpected error");
        }

        return { message: "account deleted." };
      } catch (err) {
        console.log("Catching error in deleteAccount: ", err.message);
        throw new Error("unexpected error");
      }
    },

    // Update account options
    updateAccountOptions: async (_, { options }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      // BUG: OWASP API-3 (BOPLA / mass assignment)
      // Description: Allows changes to account options that should not be updated by the client.
      // Solution: 
      // const allowedProperties = ['paperStatements', 'cardActivityAlerts', 'smsNotifications'];
      // const requestProperties = Object.keys(options);
      // if (requestProperties.length > 3 || requestProperties.some( property => !allowedProperties.includes(property)))
      // {
      //     throw new Error("invalid input");
      // }

      if ((options.paperStatements && typeof options.paperStatements !== 'boolean') ||
        (options.cardActivityAlerts && typeof options.cardActivityAlerts !== 'boolean') ||
        (options.smsNotifications && typeof options.smsNotifications !== 'boolean')) {
        throw new Error("invalid input");
      }

      try {
        const doc = await AccountModel.findOneAndUpdate(
          account._id,
          { options },
          { returnOriginal: false }
        );

        if (!doc) {
          throw new Error("unexpected error");
        }

        // BUG: OWASP API-3 (BOPLA / excessive data exposure)
        // Description: not defining and enforcing the properties returned by the API
        // Solution:
        // return {
        //   paperStatements: doc.options.paperStatements,
        //   cardActivityAlerts: doc.options.cardActivityAlerts,
        //   smsNotifications: doc.options.smsNotifications
        // }
        return doc.options;
      } catch (err) {
        console.log("Catching error in updateAccountOptions: ", err.message);
        throw new Error("unexpected error");
      }
    }
  }
};

export default accountResolvers;
