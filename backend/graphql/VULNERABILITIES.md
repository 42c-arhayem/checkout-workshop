# GraphQL API Security Vulnerabilities Guide

This document provides guidance on the intentional security vulnerabilities included in the 42c Banking GraphQL API for educational and testing purposes.

## Overview

The GraphQL implementation contains the same OWASP API Security Top 10 vulnerabilities as the REST API, adapted for GraphQL. Each vulnerability includes:
- **Description** - What the vulnerability is
- **Location** - Where to find it in the code
- **Exploitation** - GraphQL queries/mutations to demonstrate the issue
- **Solution** - Code fix to remediate the vulnerability

---

## Vulnerability Index

| ID | Vulnerability | OWASP Category | Severity |
|----|---------------|----------------|----------|
| [V1](#v1-broken-object-level-authorization-bola) | Broken Object Level Authorization | API1:2023 | High |
| [V2](#v2-broken-authentication) | DOS via Long Password | API2:2023 | Medium |
| [V3a](#v3a-mass-assignment) | Mass Assignment | API3:2023 | High |
| [V3b](#v3b-excessive-data-exposure) | Excessive Data Exposure | API3:2023 | Medium |
| [V4](#v4-unrestricted-resource-consumption) | Unrestricted Resource Consumption | API4:2023 | Medium |
| [V5](#v5-nosql-injection) | NoSQL Injection | API8:2023 | Critical |
| [V6](#v6-business-flow-abuse) | Business Logic Flaw | API6:2023 | Medium |
| [V7](#v7-server-side-request-forgery) | Server-Side Request Forgery | API7:2023 | High |
| [V8](#v8-path-traversal) | Path Traversal | A01:2021 | High |
| [V9](#v9-input-validation) | Negative Amount Payment | Input Validation | Medium |
| [V10](#v10-privilege-escalation) | Account Type Escalation | API1:2023 | High |

---

## V1: Broken Object Level Authorization (BOLA)

### Description
A user can modify another user's credit card application by providing any `referenceId`, without verification that the card belongs to them.

### Location
**File**: `resolvers/productResolvers.js`  
**Function**: `modifyCardApplication`

### Vulnerable Code
```javascript
modifyCardApplication: async (_, { referenceId, input }, { account }) => {
  // BUG: OWASP API-1 (BOLA)
  // Missing authorization check
  
  try {
    findRecord = await CreditCardModel.findOne({ _id: referenceId });
    // Proceeds without checking if referenceId belongs to the authenticated user
  }
}
```

### Exploitation

**Step 1**: User A creates a card application
```graphql
mutation {
  createCardApplication(input: { delivery: "post" }) {
    referenceId  # Returns e.g., 1001
  }
}
```

**Step 2**: User B (different user) modifies User A's card
```graphql
mutation {
  modifyCardApplication(
    referenceId: 1001
    input: { delivery: "collect" }
  ) {
    _id
    delivery
    status
  }
}
```

✅ **Success**: User B can modify User A's card application!

### Solution

**Uncomment the authorization check**:
```javascript
modifyCardApplication: async (_, { referenceId, input }, { account }) => {
  if (!account) {
    throw new Error("Unauthorized");
  }

  // SOLUTION: Verify ownership
  if (!account.products.find(product => product.referenceId == referenceId)) {
    throw new Error("card application not found");
  }

  try {
    findRecord = await CreditCardModel.findOne({ _id: referenceId });
    // ... rest of code
  }
}
```

---

## V2: Broken Authentication

### Description
The login endpoint doesn't limit password length, allowing attackers to send extremely long passwords that overwhelm the bcrypt hashing function (DOS attack).

### Location
**File**: `resolvers/authResolvers.js`  
**Function**: `login`

### Vulnerable Code
```javascript
login: async (_, { input }) => {
  const { email, pan } = input;
  
  // BUG: OWASP API-2 (Broken AuthN)
  // No length validation before expensive hashing
  
  if (!(await account.validatePan(pan))) {
    // validatePan calls bcrypt.compare() on potentially huge input
    throw new Error("invalid credentials");
  }
}
```

### Exploitation

```graphql
mutation {
  login(input: {
    email: "victim@example.com"
    pan: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA....(10000 chars)"
  }) {
    access
  }
}
```

⏱️ **Result**: Server becomes slow or unresponsive due to bcrypt processing

### Solution

**Add length validation**:
```javascript
login: async (_, { input }) => {
  const { email, pan } = input;
  
  if (typeof email !== "string" || typeof pan !== "string") {
    throw new Error("invalid input");
  }
  
  // SOLUTION: Limit password length
  if (pan.length > 5) {
    throw new Error("invalid input");
  }
  
  try {
    const account = await AccountModel.findOne({ email });
    // ... rest of code
  }
}
```

---

## V3a: Mass Assignment

### Description
The `updateAccountOptions` mutation allows updating any property in the options object, including privileged fields like `accountType` that should be read-only.

### Location
**File**: `resolvers/accountResolvers.js`  
**Function**: `updateAccountOptions`

### Vulnerable Code
```javascript
updateAccountOptions: async (_, { options }, { account }) => {
  // BUG: OWASP API-3 (BOPLA / mass assignment)
  // No property whitelist - accepts any field
  
  try {
    const doc = await AccountModel.findOneAndUpdate(
      account._id,
      { options },  // Spreads all provided properties
      { returnOriginal: false }
    );
  }
}
```

### Exploitation

**Escalate to business account**:
```graphql
mutation {
  updateAccountOptions(options: {
    paperStatements: true
    accountType: "business"  # Should not be allowed!
  }) {
    paperStatements
    accountType
  }
}
```

**Check increased overdraft**:
```graphql
query {
  getBalance {
    overdraft  # Now 10000 instead of 500!
    accountType
  }
}
```

### Solution

**Whitelist allowed properties**:
```javascript
updateAccountOptions: async (_, { options }, { account }) => {
  if (!account) {
    throw new Error("Unauthorized");
  }

  // SOLUTION: Whitelist allowed properties
  const allowedProperties = ['paperStatements', 'cardActivityAlerts', 'smsNotifications'];
  const requestProperties = Object.keys(options);
  
  if (requestProperties.some(property => !allowedProperties.includes(property))) {
    throw new Error("invalid input");
  }

  // Validation
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
    
    // Return only safe fields
    return {
      paperStatements: doc.options.paperStatements,
      cardActivityAlerts: doc.options.cardActivityAlerts,
      smsNotifications: doc.options.smsNotifications
    };
  }
}
```

---

## V3b: Excessive Data Exposure

### Description
The `updateAccountOptions` mutation returns all fields from the database, including sensitive `accountType`, instead of only the fields the user should see.

### Location
**File**: `resolvers/accountResolvers.js`  
**Function**: `updateAccountOptions`

### Vulnerable Code
```javascript
updateAccountOptions: async (_, { options }, { account }) => {
  try {
    const doc = await AccountModel.findOneAndUpdate(
      account._id,
      { options },
      { returnOriginal: false }
    );
    
    // BUG: Returns entire options object including accountType
    return doc.options;
  }
}
```

### Exploitation

```graphql
mutation {
  updateAccountOptions(options: {
    paperStatements: true
  }) {
    paperStatements
    cardActivityAlerts
    smsNotifications
    accountType  # Sensitive field leaked!
  }
}
```

### Solution

**Return only safe fields** (shown in V3a solution above)

---

## V4: Unrestricted Resource Consumption

### Description
The `getTransactionList` query returns all transactions without pagination, allowing attackers to request massive amounts of data.

### Location
**File**: `resolvers/paymentResolvers.js`  
**Function**: `getTransactionList`

### Vulnerable Code
```javascript
getTransactionList: (_, __, { account }) => {
  if (!account) {
    throw new Error("Unauthorized");
  }

  // BUG: API-4 (Unrestricted Resource Consumption)
  // Returns all transactions without limit
  return account.transactions;
}
```

### Exploitation

```graphql
query {
  getTransactionList {
    txnId
    txnType
    name
    amount
    currency
    createdAt
  }
}
```

📊 **Result**: Returns thousands of transactions, consuming bandwidth and memory

### Solution

**Limit results with pagination**:
```javascript
getTransactionList: (_, { limit = 5, offset = 0 }, { account }) => {
  if (!account) {
    throw new Error("Unauthorized");
  }

  // SOLUTION: Add pagination
  const TRANSACTIONS_PER_PAGE = limit > 100 ? 100 : limit;
  return account.transactions
    .slice(offset, offset + TRANSACTIONS_PER_PAGE);
}
```

**Update schema to support pagination**:
```graphql
type Query {
  getTransactionList(limit: Int, offset: Int): [Transaction!]!
}
```

---

## V5: NoSQL Injection

### Description
The `sourceAccountId` parameter in `createTransferPayment` is not validated, allowing NoSQL injection attacks to transfer money from other users' accounts.

### Location
**File**: `resolvers/paymentResolvers.js`  
**Function**: `createTransferPayment`

### Vulnerable Code
```javascript
createTransferPayment: async (_, { input }, { account }) => {
  const { sourceAccountId, name, iban, amount, currency, description } = input;
  
  // BUG: API-8:2019 (Injection)
  // sourceAccountId not validated - vulnerable to NoSQL injection
  
  try {
    const sourceAccount = await AccountModel.findById(sourceAccountId);
    // Can be manipulated to access other accounts
  }
}
```

### Exploitation

**Find another user's account ID** (through enumeration or leaked data):
```graphql
# Attacker uses victim's account ID
mutation {
  createTransferPayment(input: {
    sourceAccountId: "507f1f77bcf86cd799439011"  # Victim's ID
    name: "Attacker"
    iban: "GB82WEST12345698765432"
    amount: 500.00
    currency: "GBP"
    description: "Stolen funds"
  }) {
    message
    transactionId
  }
}
```

✅ **Success**: Money transferred from victim's account!

### Solution

**Validate account ownership**:
```javascript
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

  // SOLUTION: Validate sourceAccountId format and ownership
  const ACCOUNTID = /^[a-f\d]{24}$/;
  if (typeof sourceAccountId !== "string" || !ACCOUNTID.test(sourceAccountId)) {
    throw new Error("invalid input");
  }
  
  // Verify the account belongs to the authenticated user
  if (sourceAccountId !== account._id.toString()) {
    throw new Error("unauthorized account access");
  }

  // ... rest of code
}
```

---

## V6: Business Flow Abuse

### Description
Users can book unlimited mortgage consultation slots, monopolizing the team's calendar and denying service to legitimate customers.

### Location
**File**: `resolvers/productResolvers.js`  
**Function**: `createMeeting`

### Vulnerable Code
```javascript
createMeeting: async (_, { input }, { account }) => {
  const { schedule } = input;
  
  try {
    const doc = await MeetingPlannerModel.findOne({ schedule });
    
    if (doc) {
      throw new Error("the requested time slot is not available.");
    } else {
      // BUG: OWASP API-6 - No check for existing bookings by this user
      await MeetingPlannerModel.create({
        schedule: schedule,
        accountId: account._id.toString(),
      });
    }
  }
}
```

### Exploitation

**Book multiple slots**:
```graphql
mutation {
  slot1: createMeeting(input: { schedule: "2024-12-20T10:00" }) { message }
  slot2: createMeeting(input: { schedule: "2024-12-20T14:00" }) { message }
  slot3: createMeeting(input: { schedule: "2024-12-21T10:00" }) { message }
  slot4: createMeeting(input: { schedule: "2024-12-21T14:00" }) { message }
  # ... book all available slots
}
```

### Solution

**Limit bookings per user**:
```javascript
createMeeting: async (_, { input }, { account }) => {
  if (!account) {
    throw new Error("Unauthorized");
  }

  const { schedule } = input;

  if (!schedule || typeof schedule !== "string" || !DATE_TIME.test(schedule)) {
    throw new Error("invalid input");
  }

  try {
    // Check if slot is available
    const existingSlot = await MeetingPlannerModel.findOne({ schedule });
    if (existingSlot) {
      throw new Error("the requested time slot is not available.");
    }
    
    // SOLUTION: Check if user already has a booking
    const userBooking = await MeetingPlannerModel.findOne({ 
      accountId: account._id.toString() 
    });
    
    if (userBooking) {
      throw new Error("you cannot reserve more than one mortgage consultation");
    }

    await MeetingPlannerModel.create({
      schedule: schedule,
      accountId: account._id.toString(),
    });
    
    return { message: "appointment with mortgage advisor is reserved." };
  }
}
```

---

## V7: Server-Side Request Forgery (SSRF)

### Description
The `createFile` mutation accepts arbitrary URLs without validation, allowing attackers to scan internal networks or access local resources.

### Location
**File**: `resolvers/fileResolvers.js`  
**Function**: `createFile`

### Vulnerable Code
```javascript
createFile: async (_, { input }, { account }) => {
  const { url } = input;
  
  if (!url || typeof url !== "string") {
    throw new Error("invalid input");
  }
  
  // BUG: OWASP API-7 (SSRF)
  // No URL validation - accepts any URL
  
  const fileName = url.split("id=")[1];
  const outputPath = path.resolve(__dirname, '..', '..', 'app', 'downloads', `${fileName}.pdf`);
  
  await downloadFile(url, outputPath);  // Makes request to arbitrary URL
}
```

### Exploitation

**Scan internal network**:
```graphql
mutation {
  createFile(input: {
    url: "http://localhost:8888/admin"
  }) {
    message
  }
}
```

**Access cloud metadata**:
```graphql
mutation {
  createFile(input: {
    url: "http://169.254.169.254/latest/meta-data/"
  }) {
    message
  }
}
```

### Solution

**Whitelist allowed URLs**:
```javascript
createFile: async (_, { input }, { account }) => {
  if (!account) {
    throw new Error("Unauthorized");
  }

  const { url } = input;

  if (!url || typeof url !== "string") {
    throw new Error("invalid input");
  }

  // SOLUTION: Whitelist allowed URL pattern
  const URL_WHITELIST = /^https:\/\/drive\.usercontent\.google\.com\/download\?id=[A-Za-z0-9_-]{33}$/;
  
  if (!URL_WHITELIST.test(url)) {
    throw new Error("invalid input");
  }

  const fileName = url.split("id=")[1];
  const outputPath = path.resolve(__dirname, '..', '..', 'app', 'downloads', `${fileName}.pdf`);

  try {
    await downloadFile(url, outputPath);
    return { message: `File downloaded and saved` };
  }
}
```

---

## V8: Path Traversal

### Description
The `getFile` query doesn't validate the filename parameter, allowing attackers to read arbitrary files on the server using path traversal.

### Location
**File**: `resolvers/fileResolvers.js`  
**Function**: `getFile`

### Vulnerable Code
```javascript
getFile: async (_, { input }, { account }) => {
  if (!input.filename || typeof input.filename !== "string") {
    throw new Error("invalid input");
  }

  const uploadDir = path.join(__dirname, '..', '..', 'app', 'downloads');
  const filename = input.filename;
  const filePath = path.join(uploadDir, filename);
  
  // BUG: OWASP A01:2021 (Path Traversal)
  // No validation allows directory traversal
  
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(new Error("File not found."));
        return;
      }
      resolve(filePath);
    });
  });
}
```

### Exploitation

**Read sensitive files**:
```graphql
query {
  getFile(input: {
    filename: "../../../../../../../etc/passwd"
  })
}
```

```graphql
query {
  getFile(input: {
    filename: "../../../../app/.env"
  })
}
```

### Solution

**Validate filename pattern**:
```javascript
getFile: async (_, { input }, { account }) => {
  if (!account) {
    throw new Error("Unauthorized");
  }

  if (!input.filename || typeof input.filename !== "string") {
    throw new Error("invalid input");
  }

  // SOLUTION: Validate filename pattern
  const FILENAME = /^[a-zA-Z0-9._-]{5,256}$/;
  
  if (!FILENAME.test(input.filename)) {
    throw new Error("invalid input");
  }

  const uploadDir = path.join(__dirname, '..', '..', 'app', 'downloads');
  const filename = input.filename;
  const filePath = path.join(uploadDir, filename);

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(new Error("File not found."));
        return;
      }
      resolve(filePath);
    });
  });
}
```

---

## V9: Input Validation - Negative Amount

### Description
The `createBillPayment` mutation doesn't validate that payment amounts are positive, allowing users to increase their balance by sending negative payments.

### Location
**File**: `resolvers/paymentResolvers.js`  
**Function**: `createBillPayment`

### Vulnerable Code
```javascript
createBillPayment: async (_, { input }, { account }) => {
  const { name, accountNumber, amount, currency } = input;
  
  // Validation checks type but not value
  if (typeof amount !== "number") {
    throw new Error("invalid input");
  }
  
  // BUG: Amount can be negative
  // No check: if (amount < 0) ...
  
  const userAccount = await AccountModel.findById(account._id);
  userAccount.balance -= amount;  // If amount is negative, balance increases!
}
```

### Exploitation

**Increase balance with negative payment**:
```graphql
# Check initial balance
query {
  getBalance {
    balance
  }
}
# Returns: 1000.00

# Make negative payment
mutation {
  createBillPayment(input: {
    name: "Electric Company"
    accountNumber: "123456789"
    amount: -500.00  # Negative!
    currency: "GBP"
  }) {
    message
    transactionId
  }
}

# Check new balance
query {
  getBalance {
    balance
  }
}
# Returns: 1500.00 (increased by 500!)
```

### Solution

**Validate amount is positive**:
```javascript
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

  // SOLUTION: Validate amount is positive and within limits
  const TRANSFER_MAX_LIMIT = 3000.00;
  
  if (amount < 0 || amount > TRANSFER_MAX_LIMIT) {
    throw new Error("invalid amount");
  }

  // ... rest of code
}
```

---

## V10: Privilege Escalation via Registration

### Description
The `register` mutation allows users to specify any `accountType` during registration, including privileged types like "business" that should be restricted.

### Location
**File**: `resolvers/authResolvers.js`  
**Function**: `register`

### Vulnerable Code
```javascript
register: async (_, { input }) => {
  const { name, email, postalAddress, pan, accountType } = input;
  
  // BUG: OWASP A01 (Broken Access Control)
  // No validation of accountType - accepts any value
  
  account = await AccountModel.create({
    name,
    email,
    postalAddress,
    pan,
    currency: postalAddress.country.toUpperCase() === 'UK' ? "GBP" : "EUR",
    options: { accountType }  // User-controlled!
  });
}
```

### Exploitation

**Register as business account**:
```graphql
mutation {
  register(input: {
    name: "Attacker Corp"
    email: "attacker@example.com"
    postalAddress: {
      addressLine: ["123 Fake St"]
      postCode: "12345"
      country: "UK"
    }
    pan: "1234"
    accountType: "business"  # Privileged type!
  }) {
    message
    accountId
  }
}
```

**Login and check privileges**:
```graphql
mutation {
  login(input: {
    email: "attacker@example.com"
    pan: "1234"
  }) {
    access
  }
}

query {
  getBalance {
    balance
    overdraft  # Shows 10000 instead of 500!
    accountType
  }
}
```

### Solution

**Whitelist allowed account types**:
```javascript
register: async (_, { input }) => {
  const { name, email, postalAddress, pan, accountType } = input;

  if (!name || !email || !postalAddress || !pan || !accountType) {
    throw new Error("missing required field");
  }

  if (typeof name !== "string" || typeof email !== "string" || 
      typeof pan !== "string" || typeof accountType !== "string" || 
      typeof postalAddress !== "object") {
    throw new Error("invalid input");
  }

  if (!postalAddress.country) {
    throw new Error("missing required field");
  }

  // SOLUTION: Whitelist allowed account types
  const allowedAccountTypes = ['current', 'savings'];
  
  if (!allowedAccountTypes.includes(accountType)) {
    throw new Error("invalid input");
  }

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
    }
  }
}
```

---

## Testing Methodology

### Setup

1. **Start the GraphQL server**:
   ```bash
   cd backend/graphql
   npm install
   npm run dev
   ```

2. **Open GraphQL Playground**:
   - Navigate to `http://localhost:4000/graphql`

3. **Set up test accounts**:
   ```graphql
   # Create User A
   mutation {
     register(input: {
       name: "User A"
       email: "usera@test.com"
       postalAddress: { country: "UK", postCode: "SW1A 1AA" }
       pan: "1111"
       accountType: "current"
     }) {
       accountId
     }
   }
   
   # Create User B
   mutation {
     register(input: {
       name: "User B"
       email: "userb@test.com"
       postalAddress: { country: "UK", postCode: "SW1A 2AA" }
       pan: "2222"
       accountType: "current"
     }) {
       accountId
     }
   }
   ```

4. **Get authentication tokens**:
   ```graphql
   mutation {
     login(input: { email: "usera@test.com", pan: "1111" }) {
       access
     }
   }
   ```

5. **Add token to HTTP headers**:
   ```json
   {
     "Authorization": "Bearer <your_token_here>"
   }
   ```

### Test Each Vulnerability

Use the exploitation examples above for each vulnerability. Compare behavior before and after applying the solutions.

---

## GraphQL-Specific Security Considerations

### Query Complexity
GraphQL allows nested queries that can be expensive:

```graphql
# Potentially expensive query
query {
  getAccount {
    accountId
    name
    payees {
      name
      transactions {
        amount
        # ... deep nesting
      }
    }
  }
}
```

**Solution**: Implement query complexity analysis (not included in this demo).

### Introspection in Production
GraphQL introspection reveals the entire schema:

```graphql
query {
  __schema {
    types {
      name
      fields {
        name
      }
    }
  }
}
```

**Solution**: Disable introspection in production (currently enabled for demo purposes).

### Batch Attacks
GraphQL allows multiple operations in one request:

```graphql
mutation {
  req1: login(input: { email: "test@test.com", pan: "1111" }) { access }
  req2: login(input: { email: "test@test.com", pan: "2222" }) { access }
  req3: login(input: { email: "test@test.com", pan: "3333" }) { access }
  # ... 1000 more attempts
}
```

**Solution**: Implement rate limiting and operation count limits.

---

## Applying All Fixes

To secure the GraphQL API for production:

1. **Uncomment all solution code** in the resolver files
2. **Add pagination** to queries returning lists
3. **Implement query complexity limits**
4. **Disable introspection** in production
5. **Add rate limiting** (e.g., using `graphql-rate-limit`)
6. **Enable HTTPS only** for production
7. **Add request logging** and monitoring
8. **Implement query depth limiting**
9. **Add query timeout** to prevent long-running queries
10. **Consider using DataLoader** for efficient data fetching

---

## Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [GraphQL Security Best Practices](https://graphql.org/learn/best-practices/)
- [Apollo Server Security](https://www.apollographql.com/docs/apollo-server/security/authentication/)
- [42Crunch API Security Platform](https://42crunch.com/)

---

**Last Updated**: February 13, 2026  
**Version**: 1.0.0
