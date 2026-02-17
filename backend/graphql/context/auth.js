import jwt from 'jsonwebtoken';
import AccountModel from '../../app/models/accountModel.js';

/**
 * GraphQL context function
 * Extracts and validates the JWT token from the request headers
 * and attaches the authenticated account to the context
 */
const context = async ({ req }) => {
  // Get the authorization header
  const authHeader = req.headers.authorization || '';

  // Check if bearer token exists
  if (!authHeader || authHeader.split(' ')[0].toLowerCase() !== 'bearer') {
    // Return empty context if no token (public queries like login/register will work)
    return { account: null };
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.TOKEN_USER_ACCESS_SECRET);

    // Find the account
    const findAccount = await AccountModel.findById(decoded.accountId);

    if (!findAccount) {
      return { account: null };
    }

    // Add the account information to the context for later processing
    return { account: findAccount };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.log("Token expired");
    } else {
      console.log("Invalid token:", err.message);
    }
    return { account: null };
  }
};

export default context;
