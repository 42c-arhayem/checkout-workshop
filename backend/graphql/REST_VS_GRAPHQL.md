# REST vs GraphQL - Feature Comparison

## Overview

This document compares the REST and GraphQL implementations of the 42c Banking API.

## Quick Comparison Table

| Feature | REST API | GraphQL API |
|---------|----------|-------------|
| **Endpoint** | Multiple endpoints | Single `/graphql` endpoint |
| **Data Fetching** | Fixed response structure | Client-specified fields |
| **Over-fetching** | Common (returns all fields) | Eliminated (request only what you need) |
| **Under-fetching** | Requires multiple requests | Single request with nested data |
| **Documentation** | External (OpenAPI/Swagger) | Built-in (GraphQL schema) |
| **Type System** | OpenAPI schema | GraphQL SDL (strong typing) |
| **API Versioning** | Required (v1, v2, etc.) | Not typically required |
| **Caching** | HTTP caching works well | Requires additional setup |
| **File Upload** | Native support | Requires multipart spec |
| **Real-time** | Polling or WebSockets | GraphQL Subscriptions |
| **Learning Curve** | Lower (familiar HTTP) | Moderate (new paradigm) |
| **Tooling** | Postman, curl, etc. | GraphQL Playground, Apollo Studio |

## Detailed Comparison by Operation

### 1. Authentication

#### REST - Register
```http
POST /apis/banking/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "postalAddress": {
    "country": "UK",
    "postCode": "SW1A 1AA"
  },
  "pan": "1234",
  "accountType": "current"
}
```

#### GraphQL - Register
```graphql
mutation {
  register(input: {
    name: "John Doe"
    email: "john@example.com"
    postalAddress: {
      country: "UK"
      postCode: "SW1A 1AA"
    }
    pan: "1234"
    accountType: "current"
  }) {
    message
    accountId
  }
}
```

**Winner**: Tie - Both are straightforward

---

### 2. Getting Account Data

#### REST - Multiple Requests Required
```http
GET /apis/banking/v1/account
GET /apis/banking/v1/account/balances
GET /apis/banking/v1/account/payees
GET /apis/banking/v1/account/transactions
```

#### GraphQL - Single Request
```graphql
query {
  getAccount {
    accountId
    name
    email
  }
  getBalance {
    balance
    currency
    overdraft
  }
  getPayeeList {
    name
    payeeType
  }
  getTransactionList {
    amount
    createdAt
  }
}
```

**Winner**: GraphQL - Eliminates multiple round trips

---

### 3. Selective Field Fetching

#### REST - Returns All Fields
```http
GET /apis/banking/v1/account
```

Response (all fields returned):
```json
{
  "accountId": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "address": {
    "addressLine": ["123 Main St"],
    "postCode": "SW1A 1AA",
    "country": "UK"
  }
}
```

#### GraphQL - Request Only What You Need
```graphql
query {
  getAccount {
    name
    email
  }
}
```

Response (only requested fields):
```json
{
  "data": {
    "getAccount": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Winner**: GraphQL - Reduces bandwidth and improves performance

---

### 4. Error Handling

#### REST - HTTP Status Codes
```http
POST /apis/banking/v1/auth/login
```

Error Response:
```json
HTTP/1.1 401 Unauthorized

{
  "message": "invalid credentials"
}
```

#### GraphQL - Structured Errors
```graphql
mutation {
  login(input: {
    email: "wrong@example.com"
    pan: "wrong"
  }) {
    access
  }
}
```

Error Response:
```json
{
  "errors": [
    {
      "message": "invalid credentials",
      "path": ["login"]
    }
  ],
  "data": null
}
```

**Winner**: GraphQL - More detailed error information with path context

---

### 5. API Documentation

#### REST - OpenAPI/Swagger
- Requires separate OpenAPI specification file
- Documentation generated from spec
- Swagger UI for interactive testing
- Manual maintenance of spec file

#### GraphQL - Self-Documenting
- Schema IS the documentation
- Built-in introspection
- GraphQL Playground shows all types, fields, and arguments
- Documentation always in sync with implementation

**Winner**: GraphQL - Documentation is native and always accurate

---

### 6. Testing and Exploration

#### REST - Postman Collection
- Requires maintaining separate collection
- Need to know exact endpoints
- Manual request body creation
- Environment variables for tokens

#### GraphQL - GraphQL Playground
- Auto-complete for queries
- No separate collection needed
- Schema explorer
- Built-in query history
- Automatic documentation

**Winner**: GraphQL - Superior developer experience

---

## Code Complexity Comparison

### REST Implementation
```
Routes (define endpoints)
  ↓
Middleware (auth, validation)
  ↓
Controllers (business logic)
  ↓
Models (data)
```

**Files**: Multiple route files, multiple controller files

### GraphQL Implementation
```
Schema (type definitions)
  ↓
Context (auth, shared data)
  ↓
Resolvers (business logic)
  ↓
Models (data - shared with REST)
```

**Files**: Single schema file, organized resolver files

**Winner**: Tie - Similar complexity, different organization

---

## Use Case Recommendations

### Use REST When:
- ✅ Simple CRUD operations
- ✅ File upload/download is primary
- ✅ Need HTTP caching
- ✅ Team familiar with REST
- ✅ Third-party integrations expect REST
- ✅ Simple, stable API requirements

### Use GraphQL When:
- ✅ Complex, nested data requirements
- ✅ Mobile apps (reduce bandwidth)
- ✅ Multiple client types with different needs
- ✅ Rapid frontend iteration
- ✅ Real-time features needed (with subscriptions)
- ✅ Developer experience is priority
- ✅ Flexible querying needed

---

## Performance Comparison

| Metric | REST | GraphQL |
|--------|------|---------|
| **Request Count** | Multiple (N+1 problem) | Single request |
| **Response Size** | Often larger (over-fetching) | Optimized (only requested data) |
| **Server Load** | Multiple endpoints to handle | Single endpoint, resolver-based |
| **Caching** | Easy (HTTP caching) | Complex (needs custom solution) |
| **Parsing Overhead** | Minimal | Query parsing required |

---

## Security Considerations

### Both Implementations Have:
- ✅ JWT authentication
- ✅ Same business logic vulnerabilities (by design)
- ✅ Input validation
- ✅ Error handling

### GraphQL-Specific Concerns:
- ⚠️ Query complexity attacks (need depth/complexity limiting)
- ⚠️ Introspection exposure in production
- ⚠️ Batching attacks

### REST-Specific Concerns:
- ⚠️ Verb tampering (OPTIONS, TRACE, etc.)
- ⚠️ Explicit route security needed

**Winner**: Tie - Different security considerations for each

---

## When to Use Both?

You can run both APIs simultaneously:

```bash
# REST API on port 3000
cd backend/app
npm start

# GraphQL API on port 4000
cd backend/graphql
npm start
```

This allows:
- Gradual migration from REST to GraphQL
- Supporting different client types
- Using best tool for each use case
- A/B testing performance

---

## Conclusion

| Scenario | Recommendation |
|----------|----------------|
| **Existing Project** | REST (stable, proven) |
| **New Project** | GraphQL (flexibility) |
| **Mobile App** | GraphQL (bandwidth) |
| **Public API** | REST (simpler for consumers) |
| **Internal API** | GraphQL (developer productivity) |
| **Simple CRUD** | REST (less overhead) |
| **Complex Data** | GraphQL (efficiency) |

---

## Try Both!

The 42c Banking project provides both implementations with identical functionality. Try both and compare:

**REST API**:
- Postman collection: `backend/postman/`
- OpenAPI spec: `backend/openapi/`

**GraphQL API**:
- GraphQL Playground: `http://localhost:4000/graphql`
- Sample queries: `backend/graphql/SAMPLE_QUERIES.md`

---

**Last Updated**: February 13, 2026
