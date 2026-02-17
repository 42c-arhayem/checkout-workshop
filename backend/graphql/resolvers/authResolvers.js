import jwt from 'jsonwebtoken';
import AccountModel from '../../app/models/accountModel.js';

const authResolvers = {
  Mutation: {
    // Register a new user Account
    register: async (_, { input }) => {
      const { name, email, postalAddress, pan, accountType } = input;

      if (!name || !email || !postalAddress || !pan || !accountType) {
        throw new Error("missing required field");
      }

      if (typeof name !== "string" || typeof email !== "string" || typeof pan !== "string" || typeof accountType !== "string" || typeof postalAddress !== "object") {
        throw new Error("invalid input");
      }

      if (!postalAddress.country) {
        throw new Error("missing required field");
      }

      // BUG: OWASP A01 (Broken Access Control)
      // Description: Allows user to register with privileged account type.
      // Solution: 
      // const allowedAccountTypes = ['personal'];
      // if (!allowedAccountTypes.includes(accountType))
      // {
      //     throw new Error("invalid input");
      // }

      try {
        let account = await AccountModel.findOne({ email });

        if (account) {
          throw new Error("User already exists.");
        }

        account = await AccountModel.create({
          name,
          email,
          postalAddress,
          pan,
          currency: postalAddress.country.toUpperCase() === 'UK' ? "GBP" : "EUR",
          options: { accountType }
        });

        if (account) {
          return {
            message: "registration success",
            accountId: account._id.toString()
          };
        } else {
          throw new Error("invalid request");
        }
      } catch (err) {
        console.log("Catching error in register: ", err.message);
        throw new Error(err.message || "unexpected error");
      }
    },

    // Login to a user account
    login: async (_, { input }) => {
      const { email, pan } = input;

      if (typeof email !== "string" || typeof pan !== "string") {
        throw new Error("invalid input");
      }

      // BUG: OWASP API-2 (Broken AuthN)
      // Description: protect the validatePan hashing function from long password DOS
      // Solution: 
      // if(pan.length > 5) {
      //  throw new Error("invalid input");
      //}

      try {
        const account = await AccountModel.findOne({ email });

        if (account === null) {
          throw new Error("invalid account");
        }

        if (!(await account.validatePan(pan))) {
          // BUG: OWASP API-3 (BOPLA)
          // Description a user should not have direct access to the hashed pan value
          // Solution: remove the "secret" property in the returned object below
          // For GraphQL, we can't return extra fields in error, but this is noted
          throw new Error("invalid credentials");
        }

        const token = jwt.sign(
          { accountId: account._id },
          process.env.TOKEN_USER_ACCESS_SECRET,
          { expiresIn: parseInt(process.env.TOKEN_USER_ACCESS_EXPIRY) }
        );

        return {
          access: token,
          access_expires: parseInt(process.env.TOKEN_USER_ACCESS_EXPIRY)
        };
      } catch (err) {
        console.log("Catching error in login: ", err.message);
        throw new Error(err.message || "unexpected error");
      }
    }
  }
};

export default authResolvers;
