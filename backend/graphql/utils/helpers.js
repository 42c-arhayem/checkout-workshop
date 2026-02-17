/**
 * GraphQL Utilities
 * Common helper functions for GraphQL resolvers
 */

/**
 * Check if user is authenticated
 * @param {Object} context - GraphQL context
 * @throws {Error} If user is not authenticated
 */
export const requireAuth = (context) => {
  if (!context.account) {
    throw new Error('Unauthorized');
  }
  return context.account;
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate date-time format (YYYY-MM-DDTHH:MM)
 * @param {string} dateTime - DateTime string to validate
 * @returns {boolean} True if valid format
 */
export const isValidDateTime = (dateTime) => {
  const dateTimeRegex = /^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])T(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;
  return dateTimeRegex.test(dateTime);
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ObjectId to validate
 * @returns {boolean} True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  const objectIdRegex = /^[a-f\d]{24}$/i;
  return objectIdRegex.test(id);
};

/**
 * Sanitize string input to prevent injection
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (GBP, EUR, USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'GBP') => {
  const symbols = {
    GBP: '£',
    EUR: '€',
    USD: '$'
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Calculate overdraft limit based on account type
 * @param {string} accountType - Type of account
 * @returns {number} Overdraft limit
 */
export const getOverdraftLimit = (accountType) => {
  return accountType === 'business' ? 10000 : 500;
};

/**
 * Check if payment amount is within limits
 * @param {number} amount - Payment amount
 * @param {number} balance - Current balance
 * @param {string} accountType - Account type
 * @returns {boolean} True if payment is allowed
 */
export const canMakePayment = (amount, balance, accountType) => {
  const overdraftLimit = getOverdraftLimit(accountType);
  return amount <= (balance + overdraftLimit);
};

/**
 * Create pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export const createPaginationMeta = (total, page = 1, limit = 10) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
};

/**
 * Parse and validate postal address
 * @param {Object} address - Address object
 * @returns {Object} Validated address
 * @throws {Error} If address is invalid
 */
export const validateAddress = (address) => {
  if (!address || typeof address !== 'object') {
    throw new Error('Invalid address format');
  }
  
  if (!address.country) {
    throw new Error('Country is required');
  }
  
  return {
    addressLine: address.addressLine || [],
    postCode: address.postCode || '',
    country: address.country
  };
};

/**
 * Generate transaction reference
 * @returns {string} Unique transaction reference
 */
export const generateTransactionRef = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${randomStr}`.toUpperCase();
};

/**
 * Log GraphQL operation
 * @param {string} operation - Operation name
 * @param {Object} args - Operation arguments
 * @param {Object} context - GraphQL context
 */
export const logOperation = (operation, args, context) => {
  const timestamp = new Date().toISOString();
  const accountId = context.account?._id || 'unauthenticated';
  console.log(`[${timestamp}] ${operation} - Account: ${accountId}`, 
    JSON.stringify(args, null, 2));
};

export default {
  requireAuth,
  isValidEmail,
  isValidDateTime,
  isValidObjectId,
  sanitizeString,
  formatCurrency,
  getOverdraftLimit,
  canMakePayment,
  createPaginationMeta,
  validateAddress,
  generateTransactionRef,
  logOperation
};
