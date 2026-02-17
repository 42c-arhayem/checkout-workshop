# GraphQL API for 42c Banking

This is a GraphQL implementation of the 42c Banking API, providing the same functionalities as the REST API.

## Overview

The GraphQL API provides a modern, flexible alternative to the REST API with the following benefits:
- Single endpoint for all operations
- Client-specified queries (request only the data you need)
- Strong typing with GraphQL schema
- Built-in API documentation through GraphQL introspection
- Real-time capabilities (subscriptions can be added if needed)

## Getting Started

### Installation

```bash
cd backend/graphql
npm install
```

### Environment Variables

The GraphQL server uses the same environment variables as the REST API. Make sure your `.env` file is properly configured in the backend/app directory with:

```
TOKEN_USER_ACCESS_SECRET=your_secret_key
TOKEN_USER_ACCESS_EXPIRY=3600
TLS_PASSPHRASE=your_tls_passphrase
GRAPHQL_PORT=4000
```

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The GraphQL server will be available at:
- HTTP: `http://localhost:4000/graphql`
- HTTPS: `https://localhost:4443/graphql`

### Postman Collection

A comprehensive Postman collection is provided with pre-configured requests for all operations:

**Files:**
- `postman/42C-Banking-GraphQL.postman_collection.json` - Complete collection with 30+ requests
- `postman/42C-Banking-GraphQL.postman_environment.json` - Environment variables

**Features:**
- All queries and mutations organized by category
- Automatic token management (login saves token to environment)
- Vulnerability testing examples included
- Pre-configured variables for common IDs
- Test scripts for response validation

**Import Instructions:**
1. Open Postman
2. Click "Import" button
3. Select both JSON files from the `postman/` directory
4. Select the "42C Banking GraphQL Environment" from the environment dropdown
5. Start with "Register" or "Login" to get an authentication token
6. The token is automatically saved and used in subsequent requests

## API Structure

### Schema

The GraphQL schema is maintained in pure SDL format:
- **[schema/schema.graphql](schema/schema.graphql)** - Standard GraphQL SDL format (loaded directly by server.js)

The server loads the schema directly from `schema.graphql` using Node.js `readFileSync()`. No wrapper file needed!

See [schema/README.md](schema/README.md) for details on the schema implementation.

### Authentication

Most operations require authentication. To authenticate:

1. First, register or login to get an access token
2. Include the token in the Authorization header for subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

### Schema Overview

The API is organized into the following main areas:

#### Types

- **Account** - User account information
- **Balance** - Account balance and overdraft information
- **Payee** - Registered payees for payments
- **Transaction** - Payment transaction records
- **CreditCard** - Credit card application information

#### Queries

- `getAccount` - Get account details
- `getBalance` - Get account balance
- `getPayeeList` - Get list of payees
- `getTransactionList` - Get transaction history
- `getCardApplication` - Get credit card application status
- `getFile` - Get downloaded file

#### Mutations

**Auth:**
- `register` - Register a new account
- `login` - Login to account

**Account:**
- `deleteAccount` - Delete account
- `updateAccountOptions` - Update account settings

**Payees:**
- `createPayee` - Add a new payee
- `deletePayee` - Remove a payee

**Payments:**
- `createTransferPayment` - Transfer funds to a contact
- `createBillPayment` - Pay a utility bill

**Products:**
- `createCardApplication` - Apply for credit card
- `modifyCardApplication` - Modify credit card application
- `deleteCardApplication` - Cancel credit card application
- `createMeeting` - Schedule mortgage consultation

**Files:**
- `createFile` - Download file from external source

## Example Queries and Mutations

### Register a New Account

```graphql
mutation {
  register(input: {
    name: "John Doe"
    email: "john@example.com"
    postalAddress: {
      addressLine: ["123 Main St"]
      postCode: "12345"
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

### Login

```graphql
mutation {
  login(input: {
    email: "john@example.com"
    pan: "1234"
  }) {
    access
    access_expires
  }
}
```

### Get Account Details (Authenticated)

```graphql
query {
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

### Get Balance (Authenticated)

```graphql
query {
  getBalance {
    accountId
    currency
    balance
    overdraft
  }
}
```

### Create a Payee (Authenticated)

```graphql
mutation {
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

### Get Payee List (Authenticated)

```graphql
query {
  getPayeeList {
    payeeId
    name
    payeeType
    iban
    accountNumber
  }
}
```

### Create Transfer Payment (Authenticated)

```graphql
mutation {
  createTransferPayment(input: {
    sourceAccountId: "your_account_id"
    name: "Jane Smith"
    iban: "GB29NWBK60161331926819"
    amount: 100.50
    currency: "GBP"
    description: "Payment for services"
  }) {
    message
    transactionId
  }
}
```

### Create Bill Payment (Authenticated)

```graphql
mutation {
  createBillPayment(input: {
    name: "Electric Company"
    accountNumber: "123456789"
    amount: 75.00
    currency: "GBP"
  }) {
    message
    transactionId
  }
}
```

### Get Transaction List (Authenticated)

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

### Apply for Credit Card (Authenticated)

```graphql
mutation {
  createCardApplication(input: {
    delivery: "post"
  }) {
    message
    referenceId
  }
}
```

### Get Card Application Status (Authenticated)

```graphql
query {
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

### Update Account Options (Authenticated)

```graphql
mutation {
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

### Schedule Mortgage Meeting (Authenticated)

```graphql
mutation {
  createMeeting(input: {
    schedule: "2024-12-25T14:30"
  }) {
    message
  }
}
```

## GraphQL Playground

When the server is running in development mode, you can access GraphQL Playground at:
- `http://localhost:4000/graphql`
- `https://localhost:4443/graphql`

GraphQL Playground provides:
- Interactive query editor with autocomplete
- Schema documentation explorer
- Query history
- Variable editor for parameterized queries

## Comparison with REST API

| REST Endpoint | GraphQL Equivalent |
|--------------|-------------------|
| POST /auth/register | `mutation { register(...) }` |
| POST /auth/login | `mutation { login(...) }` |
| GET /account | `query { getAccount }` |
| DELETE /account | `mutation { deleteAccount }` |
| PUT /account | `mutation { updateAccountOptions(...) }` |
| GET /account/balances | `query { getBalance }` |
| GET /account/payees | `query { getPayeeList }` |
| POST /account/payees | `mutation { createPayee(...) }` |
| DELETE /account/payees/:id | `mutation { deletePayee(...) }` |
| POST /account/payments/transfer | `mutation { createTransferPayment(...) }` |
| POST /account/payments/bill | `mutation { createBillPayment(...) }` |
| GET /account/transactions | `query { getTransactionList }` |
| GET /account/products/cards | `query { getCardApplication }` |
| POST /account/products/cards | `mutation { createCardApplication(...) }` |
| PUT /account/products/cards/:id | `mutation { modifyCardApplication(...) }` |
| DELETE /account/products/cards/:id | `mutation { deleteCardApplication(...) }` |
| POST /account/products/mortgages/meeting | `mutation { createMeeting(...) }` |
| POST /account/files | `mutation { createFile(...) }` |
| GET /account/files | `query { getFile(...) }` |

## Error Handling

GraphQL returns errors in a structured format:

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "path": ["getAccount"]
    }
  ],
  "data": null
}
```

Common error messages:
- `"Unauthorized"` - Missing or invalid authentication token
- `"invalid input"` - Invalid input data
- `"missing required field"` - Required field not provided
- `"unexpected error"` - Internal server error

## Security Notes

⚠️ **Important:** This implementation intentionally contains security vulnerabilities for educational and testing purposes.

The GraphQL API includes the same OWASP API Security Top 10 vulnerabilities as the REST API:

| Vulnerability | OWASP | GraphQL Operation | Source File |
|--------------|-------|-------------------|-------------|
| Broken Object Level Authorization (BOLA) | API1:2023 | `modifyCardApplication` | productResolvers.js |
| DOS via Long Password | API2:2023 | `login` | authResolvers.js |
| Mass Assignment | API3:2023 | `updateAccountOptions` | accountResolvers.js |
| Excessive Data Exposure | API3:2023 | `updateAccountOptions` | accountResolvers.js |
| Unrestricted Resource Consumption | API4:2023 | `getTransactionList` | paymentResolvers.js |
| NoSQL Injection | API8:2023 | `createTransferPayment` | paymentResolvers.js |
| Business Logic Flaw | API6:2023 | `createMeeting` | productResolvers.js |
| Server-Side Request Forgery (SSRF) | API7:2023 | `createFile` | fileResolvers.js |
| Path Traversal | A01:2021 | `getFile` | fileResolvers.js |
| Negative Amount | Input Validation | `createBillPayment` | paymentResolvers.js |
| Privilege Escalation | API1:2023 | `register` | authResolvers.js |

📖 **Complete Security Guide**: [VULNERABILITIES.md](VULNERABILITIES.md)

This comprehensive guide includes:
- ✅ Detailed descriptions of each vulnerability
- ✅ GraphQL queries to exploit them
- ✅ Step-by-step exploitation examples
- ✅ Complete code fixes and solutions
- ✅ Testing methodology and setup instructions
- ✅ GraphQL-specific security considerations

All vulnerability fixes are commented in the resolver code with `// SOLUTION:` markers.

### GraphQL-Specific Security Concerns

In addition to the OWASP vulnerabilities, be aware of GraphQL-specific security issues:

1. **Query Complexity** - Deeply nested queries can overwhelm the server
2. **Introspection Exposure** - Schema is fully visible (disable in production)
3. **Batch Attacks** - Multiple operations allowed in single request
4. **Query Depth** - No depth limiting implemented
5. **Field Suggestions** - Error messages reveal schema structure

See [VULNERABILITIES.md](VULNERABILITIES.md) for detailed mitigations.

## Architecture

```
backend/graphql/
├── server.js                 # GraphQL server setup
├── package.json              # Dependencies
├── README.md                 # This file
├── VULNERABILITIES.md        # Security testing guide
├── SAMPLE_QUERIES.md         # Example queries
├── schema/
│   ├── schema.graphql       # GraphQL SDL schema
│   └── README.md            # Schema documentation
├── resolvers/
│   ├── index.js             # Combined resolvers
│   ├── authResolvers.js     # Authentication mutations
│   ├── accountResolvers.js  # Account queries/mutations
│   ├── paymentResolvers.js  # Payment operations
│   ├── productResolvers.js  # Product operations
│   └── fileResolvers.js     # File operations
├── context/
│   └── auth.js              # Authentication context
└── utils/
    └── helpers.js           # Utility functions
```

## Development Tips

1. Use GraphQL Playground for testing queries interactively
2. Enable Chrome/Firefox GraphQL extensions for better debugging
3. Check the schema documentation in Playground for available fields
4. Use fragments to reuse common field selections
5. Use variables for dynamic query parameters

## Future Enhancements

Potential improvements for the GraphQL API:

- Add GraphQL subscriptions for real-time updates
- Implement DataLoader for efficient batching and caching
- Add query complexity analysis to prevent abuse
- Implement field-level authorization
- Add pagination for transaction lists
- Create custom scalar types for dates, currency, etc.
- Add rate limiting per resolver
- Implement query depth limiting
- Add request logging and monitoring
