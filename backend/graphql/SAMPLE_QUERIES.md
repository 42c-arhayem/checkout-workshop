# GraphQL Sample Queries and Mutations

This file contains sample GraphQL operations for testing the 42c Banking GraphQL API.

## Authentication Operations

### Register New Account
```graphql
mutation RegisterAccount {
  register(input: {
    name: "John Doe"
    email: "john.doe@example.com"
    postalAddress: {
      addressLine: ["123 Main Street", "Apartment 4B"]
      postCode: "SW1A 1AA"
      country: "UK"
    }
    pan: "1234"
    accountType: "current"
  }) {
    message
    accountId
  }
}
```

### Register Business Account (Vulnerable to privilege escalation)
```graphql
mutation RegisterBusinessAccount {
  register(input: {
    name: "Business Corp"
    email: "business@example.com"
    postalAddress: {
      addressLine: ["456 Corporate Blvd"]
      postCode: "10001"
      country: "US"
    }
    pan: "5678"
    accountType: "business"
  }) {
    message
    accountId
  }
}
```

### Login
```graphql
mutation Login {
  login(input: {
    email: "john.doe@example.com"
    pan: "1234"
  }) {
    access
    access_expires
  }
}
```

### Login with Variables
```graphql
mutation Login($email: String!, $pan: String!) {
  login(input: {
    email: $email
    pan: $pan
  }) {
    access
    access_expires
  }
}
```

Variables:
```json
{
  "email": "john.doe@example.com",
  "pan": "1234"
}
```

## Account Operations (Require Authentication)

### Get Account Details
```graphql
query GetAccount {
  getAccount {
    accountId
    name
    email
    address {
      addressLine
      postCode
      country
    }
  }
}
```

### Get Balance
```graphql
query GetBalance {
  getBalance {
    accountId
    currency
    balance
    overdraft
  }
}
```

### Update Account Options
```graphql
mutation UpdateOptions {
  updateAccountOptions(options: {
    paperStatements: true
    cardActivityAlerts: false
    smsNotifications: true
  }) {
    paperStatements
    cardActivityAlerts
    smsNotifications
    accountType
  }
}
```

### Delete Account
```graphql
mutation DeleteAccount {
  deleteAccount {
    message
  }
}
```

## Payee Operations (Require Authentication)

### Get Payee List
```graphql
query GetPayees {
  getPayeeList {
    payeeId
    name
    payeeType
    iban
    accountNumber
  }
}
```

### Create Contact Payee
```graphql
mutation CreateContactPayee {
  createPayee(input: {
    payeeType: "contact"
    name: "Jane Smith"
    iban: "GB29NWBK60161331926819"
  }) {
    message
    payeeId
  }
}
```

### Create Utility Payee
```graphql
mutation CreateUtilityPayee {
  createPayee(input: {
    payeeType: "utility"
    name: "Thames Water"
    accountNumber: "123456789"
  }) {
    message
    payeeId
  }
}
```

### Delete Payee
```graphql
mutation DeletePayee($payeeId: ID!) {
  deletePayee(payeeId: $payeeId) {
    message
  }
}
```

Variables:
```json
{
  "payeeId": "your_payee_id_here"
}
```

## Payment Operations (Require Authentication)

### Create Transfer Payment
```graphql
mutation CreateTransfer {
  createTransferPayment(input: {
    sourceAccountId: "your_account_id_here"
    name: "Jane Smith"
    iban: "GB29NWBK60161331926819"
    amount: 150.00
    currency: "GBP"
    description: "Rent payment"
  }) {
    message
    transactionId
  }
}
```

### Create Bill Payment
```graphql
mutation CreateBillPayment {
  createBillPayment(input: {
    name: "Thames Water"
    accountNumber: "123456789"
    amount: 45.50
    currency: "GBP"
  }) {
    message
    transactionId
  }
}
```

### Create Bill Payment (Vulnerable - negative amount)
```graphql
mutation CreateNegativeBillPayment {
  createBillPayment(input: {
    name: "Thames Water"
    accountNumber: "123456789"
    amount: -100.00
    currency: "GBP"
  }) {
    message
    transactionId
  }
}
```

## Transaction Operations (Require Authentication)

### Get Transaction List
```graphql
query GetTransactions {
  getTransactionList {
    txnId
    txnType
    name
    accountNumber
    iban
    amount
    currency
    createdAt
  }
}
```

### Get Transactions with Limited Fields
```graphql
query GetTransactionsLimited {
  getTransactionList {
    txnId
    txnType
    amount
    currency
    createdAt
  }
}
```

## Credit Card Operations (Require Authentication)

### Apply for Credit Card (Post Delivery)
```graphql
mutation ApplyForCard {
  createCardApplication(input: {
    delivery: "post"
  }) {
    message
    referenceId
  }
}
```

### Apply for Credit Card (Collect)
```graphql
mutation ApplyForCardCollect {
  createCardApplication(input: {
    delivery: "collect"
  }) {
    message
    referenceId
  }
}
```

### Get Card Application Status
```graphql
query GetCardApplication {
  getCardApplication {
    _id
    name
    delivery
    status
    address {
      addressLine
      postCode
      country
    }
  }
}
```

### Modify Card Application
```graphql
mutation ModifyCardApplication($referenceId: Int!) {
  modifyCardApplication(
    referenceId: $referenceId
    input: {
      delivery: "collect"
    }
  ) {
    _id
    name
    delivery
    status
    address {
      addressLine
      postCode
      country
    }
  }
}
```

Variables:
```json
{
  "referenceId": 1001
}
```

### Modify Card Delivery Address
```graphql
mutation ModifyCardAddress($referenceId: Int!) {
  modifyCardApplication(
    referenceId: $referenceId
    input: {
      postalAddress: {
        addressLine: ["789 New Street"]
        postCode: "SW1A 2AA"
        country: "UK"
      }
    }
  ) {
    _id
    name
    delivery
    status
    address {
      addressLine
      postCode
      country
    }
  }
}
```

### Delete Card Application
```graphql
mutation DeleteCardApplication($referenceId: Int!) {
  deleteCardApplication(referenceId: $referenceId) {
    message
  }
}
```

## Mortgage Meeting Operations (Require Authentication)

### Schedule Mortgage Meeting
```graphql
mutation ScheduleMeeting {
  createMeeting(input: {
    schedule: "2024-12-20T14:30"
  }) {
    message
  }
}
```

### Schedule Multiple Meetings (Vulnerable - business flow)
```graphql
mutation ScheduleMultipleMeetings {
  meeting1: createMeeting(input: { schedule: "2024-12-20T10:00" }) {
    message
  }
  meeting2: createMeeting(input: { schedule: "2024-12-20T14:00" }) {
    message
  }
  meeting3: createMeeting(input: { schedule: "2024-12-21T10:00" }) {
    message
  }
}
```

## File Operations (Require Authentication)

### Download File from URL
```graphql
mutation DownloadFile {
  createFile(input: {
    url: "https://drive.usercontent.google.com/download?id=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7"
  }) {
    message
  }
}
```

### Download File (Vulnerable SSRF)
```graphql
mutation DownloadFileSSRF {
  createFile(input: {
    url: "http://localhost:8888/admin"
  }) {
    message
  }
}
```

### Get File
```graphql
query GetFile {
  getFile(input: {
    filename: "document.pdf"
  })
}
```

### Get File (Vulnerable Path Traversal)
```graphql
query GetFilePathTraversal {
  getFile(input: {
    filename: "../../../etc/passwd"
  })
}
```

## Combined Operations

### Complete User Flow
```graphql
# Step 1: Register
mutation Step1_Register {
  register(input: {
    name: "Alice Johnson"
    email: "alice@example.com"
    postalAddress: {
      addressLine: ["10 Downing Street"]
      postCode: "SW1A 2AA"
      country: "UK"
    }
    pan: "9999"
    accountType: "savings"
  }) {
    message
    accountId
  }
}

# Step 2: Login (use token in Authorization header)
mutation Step2_Login {
  login(input: {
    email: "alice@example.com"
    pan: "9999"
  }) {
    access
    access_expires
  }
}

# Step 3: Get account info
query Step3_GetAccount {
  getAccount {
    accountId
    name
    email
    address {
      country
    }
  }
  getBalance {
    balance
    currency
    overdraft
  }
}

# Step 4: Add a payee
mutation Step4_AddPayee {
  createPayee(input: {
    payeeType: "contact"
    name: "Bob Williams"
    iban: "GB82WEST12345698765432"
  }) {
    message
    payeeId
  }
}

# Step 5: Make a payment
mutation Step5_MakePayment {
  createTransferPayment(input: {
    sourceAccountId: "your_account_id"
    name: "Bob Williams"
    iban: "GB82WEST12345698765432"
    amount: 50.00
    currency: "GBP"
    description: "Dinner payment"
  }) {
    message
    transactionId
  }
}

# Step 6: Check transactions
query Step6_CheckTransactions {
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

## Testing Authentication

### Query Without Token (Should Fail)
```graphql
query UnauthorizedQuery {
  getAccount {
    accountId
    name
  }
}
```

Expected error:
```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "path": ["getAccount"]
    }
  ]
}
```

## Advanced Queries

### Get Multiple Resources in One Request
```graphql
query GetDashboard {
  account: getAccount {
    accountId
    name
    email
  }
  balance: getBalance {
    balance
    currency
    overdraft
  }
  payees: getPayeeList {
    payeeId
    name
    payeeType
  }
  transactions: getTransactionList {
    txnId
    txnType
    amount
    createdAt
  }
}
```

### Using Fragments for Reusable Fields
```graphql
fragment AddressFields on Address {
  addressLine
  postCode
  country
}

query GetAccountWithFragments {
  getAccount {
    accountId
    name
    address {
      ...AddressFields
    }
  }
}

query GetCardWithFragments {
  getCardApplication {
    _id
    name
    delivery
    status
    address {
      ...AddressFields
    }
  }
}
```

## Setting Up HTTP Headers in GraphQL Playground

After logging in, add the authentication token to your HTTP headers:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Notes

- All mutations that modify data require authentication except `register` and `login`
- All queries require authentication
- The same security vulnerabilities from the REST API are present in this GraphQL implementation
- Variables provide type safety and prevent injection attacks (use them in production!)
- GraphQL allows you to request only the fields you need, reducing bandwidth
