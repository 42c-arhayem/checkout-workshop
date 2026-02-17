# GraphQL API for 42c Banking

This is a GraphQL implementation of the 42c Banking API, providing the same functionalities as the REST API.

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd backend/graphql
npm install

# 2. Choose your schema version and start the server

# Option A: Run VULNERABLE schema (for security testing/education)
npm run dev
# or
GRAPHQL_SCHEMA=vulnerable npm run dev

# Option B: Run SECURED schema (production-ready, 90%+ security score)
GRAPHQL_SCHEMA=secured npm run dev

# 3. Access GraphQL Playground
# Open http://localhost:4000/graphql in your browser
```

## 📊 Two Schema Versions

This implementation provides **two complete GraphQL schema versions**:

### 1. 🔴 Vulnerable Schema (`schema.graphql`) - 26.97% Security Score
- **Purpose**: Security testing, education, vulnerability demonstrations
- **Use Case**: Testing with 42Crunch API Security, learning about GraphQL vulnerabilities
- **Status**: Intentionally vulnerable (10 critical security issues)
- **Run With**: `GRAPHQL_SCHEMA=vulnerable npm run dev` (default)

### 2. 🛡️ Secured Schema (`schema-secured.graphql`) - 90%+ Security Score
- **Purpose**: Production deployment
- **Use Case**: Real-world applications requiring security
- **Features**: 
  - 10 custom scalar types with validation
  - 4 security directives (@stringValue, @numberValue, @list, @cost)
  - All OWASP API Security Top 10 vulnerabilities fixed
  - Query complexity controls and collection limits
- **Run With**: `GRAPHQL_SCHEMA=secured npm run dev`

**Documentation:**
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Complete vulnerability analysis (723 lines)
- [AUDIT_QUICK_REFERENCE.md](./AUDIT_QUICK_REFERENCE.md) - Quick reference guide (339 lines)
- Run `./audit_report.sh` for interactive security presentation

## Overview

The GraphQL API provides a modern, flexible alternative to the REST API with the following benefits:
- Single endpoint for all operations
- Client-specified queries (request only the data you need)
- Strong typing with GraphQL schema
- Built-in API documentation through GraphQL introspection
- Real-time capabilities (subscriptions can be added if needed)
- **Choice of vulnerable or production-ready schema**

## Getting Started

### Installation

```bash
cd backend/graphql
npm install
```

### Environment Variables

The GraphQL server uses the same environment variables as the REST API. Make sure your `.env` file is properly configured in the backend/app directory with:

```bash
# Authentication
TOKEN_USER_ACCESS_SECRET=your_secret_key
TOKEN_USER_ACCESS_EXPIRY=3600

# TLS/HTTPS Configuration
TLS_PASSPHRASE=your_tls_passphrase

# Server Configuration
GRAPHQL_PORT=4000

# Schema Version Selection
# Options: 'vulnerable' (default) | 'secured'
GRAPHQL_SCHEMA=vulnerable
```

**Schema Version Control:**
- `GRAPHQL_SCHEMA=vulnerable` - Loads `schema/schema.graphql` (26.97% score, for testing)
- `GRAPHQL_SCHEMA=secured` - Loads `schema/schema-secured.graphql` (90%+ score, for production)
- If not set, defaults to `vulnerable`

### Running the Server

```bash
# Development mode with auto-reload (uses vulnerable schema by default)
npm run dev

# Development mode with SECURED schema
GRAPHQL_SCHEMA=secured npm run dev

# Production mode with SECURED schema (recommended)
GRAPHQL_SCHEMA=secured npm start
```

**The server will display which schema is loaded:**
```
🚀 Loading GraphQL schema: schema-secured.graphql
   Version: 🛡️  SECURED (90%+ score)
   To switch: Set GRAPHQL_SCHEMA=secured or GRAPHQL_SCHEMA=vulnerable
```

**Access Points:**
- HTTP: `http://localhost:4000/graphql`
- HTTPS: `https://localhost:4443/graphql`

### Switching Between Schema Versions

**Method 1: Environment Variable**
```bash
# Run with vulnerable schema
GRAPHQL_SCHEMA=vulnerable npm run dev

# Run with secured schema
GRAPHQL_SCHEMA=secured npm run dev
```

**Method 2: Update .env File**
```bash
# Add to backend/app/.env or backend/graphql/.env
GRAPHQL_SCHEMA=secured
```

**Method 3: Export Environment Variable**
```bash
# For your current terminal session
export GRAPHQL_SCHEMA=secured
npm run dev
```

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

### 🛡️ Two Security Profiles

This implementation provides **two complete schema versions** with different security postures:

#### 1. Vulnerable Schema (schema.graphql) - 26.97% Score

⚠️ **Purpose:** Educational and testing use only

This schema intentionally contains security vulnerabilities matching the OWASP API Security Top 10:

| Vulnerability | OWASP | GraphQL Operation | Severity |
|--------------|-------|-------------------|----------|
| Broken Object Level Authorization (BOLA) | API1:2023 | `modifyCardApplication` | 🔴 CRITICAL |
| DOS via Long Password | API2:2023 | `login` | 🔴 CRITICAL |
| Mass Assignment | API3:2023 | `updateAccountOptions` | 🔴 CRITICAL |
| Excessive Data Exposure | API3:2023 | All queries | 🟠 HIGH |
| Unrestricted Resource Consumption | API4:2023 | `getTransactionList` | 🟠 HIGH |
| NoSQL Injection | API8:2023 | `createTransferPayment` | 🔴 CRITICAL |
| Business Logic Flaw | API6:2023 | `createMeeting` | 🟠 HIGH |
| Server-Side Request Forgery (SSRF) | API7:2023 | `createFile` | 🔴 CRITICAL |
| Path Traversal | A01:2021 | `getFile` | 🔴 CRITICAL |
| Negative Amount | Input Validation | `createBillPayment` | 🟡 MEDIUM |
| Privilege Escalation | API1:2023 | `register` | 🔴 CRITICAL |

**Use Cases:**
- Security training and education
- Testing with 42Crunch API Security platform
- CI/CD security scanning demonstrations
- Vulnerability assessment practice

#### 2. Secured Schema (schema-secured.graphql) - 90%+ Score

✅ **Purpose:** Production deployment

**All vulnerabilities fixed with:**
- 10 custom scalar types (Email, PAN, IBAN, Amount, Currency, DateTime, CustomString, CustomID, CustomInt, CustomFloat)
- Input validation with regex patterns and length constraints
- Range validation with @numberValue directive
- Collection size limits with @list directive
- Query complexity controls with @cost directive
- Proper authorization checks in resolvers
- SSRF protection with URL whitelisting
- Path traversal prevention with filename validation
- Business logic rate limiting

**Security Improvements:**
- ✅ Input sanitization and validation
- ✅ Query complexity budgeting (max 1000 points)
- ✅ Collection limits (max 10,000 items)
- ✅ Ownership validation in resolvers
- ✅ Format validation (IBAN, Email, Currency)
- ✅ Range constraints (amounts, integers)
- ✅ DOS protection (password max 64 chars)

### 📚 Complete Security Documentation

**For detailed security information, see:**

1. **[SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)** (723 lines)
   - Complete analysis of all 10 vulnerabilities
   - Before/after code comparisons
   - Step-by-step remediation
   - OWASP API Security mapping
   - Testing instructions

2. **[AUDIT_QUICK_REFERENCE.md](./AUDIT_QUICK_REFERENCE.md)** (339 lines)
   - At-a-glance security improvements
   - Custom scalar reference
   - Security directive usage
   - Query complexity costs
   - Validation examples

3. **[audit_report.sh](./audit_report.sh)** - Interactive Presentation
   ```bash
   ./backend/graphql/audit_report.sh
   ```
   - Step-by-step walkthrough of all fixes
   - Color-coded output
   - Perfect for demos and training

### GraphQL-Specific Security (Vulnerable Schema Only)

When using the **vulnerable schema**, be aware of GraphQL-specific security issues:

1. **Query Complexity** - Deeply nested queries can overwhelm the server
2. **Introspection Exposure** - Schema is fully visible (disable in production)
3. **Batch Attacks** - Multiple operations allowed in single request
4. **Query Depth** - No depth limiting implemented
5. **Field Suggestions** - Error messages reveal schema structure

**These are addressed in the secured schema** with @cost directives, query complexity analysis, and collection limits.

## Architecture

```
backend/graphql/
├── server.js                       # GraphQL server (auto-loads schema based on env var)
├── package.json                    # Dependencies
├── README.md                       # This file
├── SAMPLE_QUERIES.md              # Example queries
├── SECURITY_AUDIT_REPORT.md       # Complete security audit (723 lines)
├── AUDIT_QUICK_REFERENCE.md       # Quick security reference (339 lines)
├── audit_report.sh                # Interactive security demo
├── IMPLEMENTATION_SUMMARY.md      # Full implementation details
├── schema/
│   ├── schema.graphql             # Vulnerable version (26.97% score)
│   ├── schema-secured.graphql     # Production version (90%+ score)
│   ├── audit-report.json          # 42Crunch audit results
│   └── README.md                  # Schema documentation
├── resolvers/
│   ├── index.js                   # Combined resolvers
│   ├── authResolvers.js           # Authentication
│   ├── accountResolvers.js        # Account operations
│   ├── paymentResolvers.js        # Payments & transactions
│   ├── productResolvers.js        # Cards & meetings
│   └── fileResolvers.js           # File operations
├── context/
│   └── auth.js                    # Authentication context
└── utils/
    └── helpers.js                 # Utility functions
```

## Maintenance Guide

### Adding New Features

**When adding new queries/mutations, maintain BOTH schemas:**

1. **Update Vulnerable Schema** (`schema/schema.graphql`)
   ```graphql
   type Mutation {
     newOperation(input: String!): Response!
   }
   ```

2. **Update Secured Schema** (`schema/schema-secured.graphql`)
   ```graphql
   type Mutation {
     newOperation(
       input: CustomString! @stringValue(maxLength: 255)
     ): Response! @cost(weight: 15)
   }
   ```

3. **Add Resolver** (`resolvers/[category]Resolvers.js`)
   ```javascript
   newOperation: async (_, { input }, { account }) => {
     if (!account) throw new Error('Unauthorized');
     // Implementation
   }
   ```

4. **Test Both Versions**
   ```bash
   # Test vulnerable
   GRAPHQL_SCHEMA=vulnerable npm run dev
   
   # Test secured
   GRAPHQL_SCHEMA=secured npm run dev
   ```

### Schema Synchronization Checklist

When updating schemas, ensure:
- ☐ Both schemas have the same types, queries, and mutations
- ☐ Secured schema adds validation directives
- ☐ Secured schema uses custom scalars instead of generic types
- ☐ All mutations in secured schema have @cost directives
- ☐ All collections in secured schema have @list directives
- ☐ Resolvers work with both schema versions
- ☐ Both versions tested with sample queries
- ☐ Security audit run on secured schema

### Monitoring & Debugging

**Server logs show which schema is loaded:**
```
🚀 Loading GraphQL schema: schema-secured.graphql
   Version: 🛡️  SECURED (90%+ score)
   To switch: Set GRAPHQL_SCHEMA=secured or GRAPHQL_SCHEMA=vulnerable
```

**Check current schema in GraphQL Playground:**
- Docs tab shows all types and directives
- Secured schema will show custom scalars (Email, IBAN, Amount, etc.)
- Vulnerable schema will show generic types (String, Int, Float)

**Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Schema not switching | Environment variable not set | Run `export GRAPHQL_SCHEMA=secured` |
| Custom scalar errors | Using vulnerable schema | Switch to `GRAPHQL_SCHEMA=secured` |
| Missing directives | Schema file mismatch | Check which file is loaded in server logs |
| Validation failures | Using secured schema | This is expected - validation is working! |

### Dependencies Management

**Keep dependencies updated:**
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update specific package
npm update apollo-server-express

# Audit security vulnerabilities
npm audit
npm audit fix
```

### Testing Workflow

1. **Unit Testing** - Test resolvers independently
2. **Integration Testing** - Test with both schemas
3. **Security Testing** - Run 42Crunch audit
4. **Performance Testing** - Test query complexity limits

## Development Tips

1. Use GraphQL Playground for testing queries interactively
2. Enable Chrome/Firefox GraphQL extensions for better debugging
3. Check the schema documentation in Playground for available fields
4. Use fragments to reuse common field selections
5. Use variables for dynamic query parameters
6. **Always test with both schema versions before deploying**
7. **Run security audits after schema changes**
8. **Monitor query complexity in production**

## Deployment Checklist

### For Production Deployment

- ☐ Set `GRAPHQL_SCHEMA=secured` in production environment
- ☐ Set `NODE_ENV=production`
- ☐ Disable introspection in production (set in server.js)
- ☐ Disable playground in production (set in server.js)
- ☐ Configure proper CORS policies
- ☐ Set up query complexity limits
- ☐ Configure rate limiting
- ☐ Set up monitoring and logging
- ☐ Review and update JWT secret
- ☐ Configure TLS certificates properly
- ☐ Run security audit: `npm run audit:security`
- ☐ Load test with expected traffic

### For Testing/Staging Environment

- ☐ Use `GRAPHQL_SCHEMA=vulnerable` for security testing
- ☐ Enable introspection and playground
- ☐ Document all found vulnerabilities
- ☐ Test exploitation scenarios
- ☐ Verify fixes in secured schema

## Future Enhancements

Potential improvements for future versions:

**Already Implemented in Secured Schema:**
- ✅ Custom scalar types for dates, currency, email, etc. (10 custom scalars)
- ✅ Query complexity analysis to prevent abuse (@cost directive)
- ✅ Field-level validation (@stringValue, @numberValue directives)
- ✅ Collection limits (@list directive with min/maxItems)

**Future Roadmap:**
- 🔄 Add GraphQL subscriptions for real-time transaction updates
- 🔄 Implement DataLoader for efficient batching and caching
- 🔄 Add field-level authorization with custom directives
- 🔄 Create cursor-based pagination for large result sets
- 🔄 Implement query depth limiting (complementing complexity limits)
- 🔄 Add per-resolver rate limiting
- 🔄 Implement request logging and monitoring
- 🔄 Add Apollo Studio integration for performance monitoring
- 🔄 Create persistent queries / query allowlisting
- 🔄 Add response caching with Redis
- 🔄 Implement GraphQL Federation for microservices
- 🔄 Add automated schema diffing in CI/CD
