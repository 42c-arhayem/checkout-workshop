# GraphQL API Quick Start Guide

Get the 42c Banking GraphQL API running in 5 minutes.

## TL;DR

```bash
cd backend/graphql
npm install

# Run vulnerable schema (for testing)
npm run dev

# OR run secured schema (for production)
GRAPHQL_SCHEMA=secured npm run dev

# Open GraphQL Playground
open http://localhost:4000/graphql
```

## Choose Your Schema

| Schema | Command | Score | Use Case |
|--------|---------|-------|----------|
| 🔴 **Vulnerable** | `npm run dev` | 26.97% | Security testing, education |
| 🟢 **Secured** | `GRAPHQL_SCHEMA=secured npm run dev` | 90%+ | Production deployment |

## Installation

```bash
# 1. Navigate to GraphQL directory
cd backend/graphql

# 2. Install dependencies (~30 seconds)
npm install

# 3. Verify environment (optional)
cp .env.example ../.env  # If not already configured
```

## Running the Server

### Option 1: Vulnerable Schema (Default)
```bash
npm run dev
```

### Option 2: Secured Schema
```bash
GRAPHQL_SCHEMA=secured npm run dev
```

### Option 3: Using .env File
```bash
# Add to backend/graphql/.env or backend/app/.env
echo "GRAPHQL_SCHEMA=secured" >> .env
npm run dev
```

## First API Calls

### 1. Register a User
```graphql
mutation {
  register(input: {
    name: "Test User"
    email: "test@example.com"
    postalAddress: { country: "UK", postCode: "SW1A 1AA" }
    pan: "password123"
    accountType: "personal"
  }) {
    message
    accountId
  }
}
```

### 2. Login
```graphql
mutation {
  login(input: {
    email: "test@example.com"
    pan: "password123"
  }) {
    access
  }
}
```

### 3. Get Account (Add token to HTTP Headers)
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

```graphql
query {
  getAccount {
    name
    email
  }
  getBalance {
    balance
    currency
  }
}
```

## Switching Between Schemas

### Method 1: Environment Variable (Quickest)
```bash
GRAPHQL_SCHEMA=secured npm run dev
GRAPHQL_SCHEMA=vulnerable npm run dev
```

### Method 2: Export for Session
```bash
export GRAPHQL_SCHEMA=secured
npm run dev
```

### Method 3: Update .env File
```bash
# Edit .env file
GRAPHQL_SCHEMA=secured
```

## Verify Which Schema is Loaded

The server logs show which schema is active:

```
🚀 Loading GraphQL schema: schema-secured.graphql
   Version: 🛡️  SECURED (90%+ score)
   To switch: Set GRAPHQL_SCHEMA=secured or GRAPHQL_SCHEMA=vulnerable
```

## Testing with Postman

```bash
# Import Postman collections (located in postman/ directory)
1. Open Postman
2. Import: postman/42C-Banking-GraphQL.postman_collection.json
3. Import: postman/42C-Banking-GraphQL.postman_environment.json
4. Select "42C Banking GraphQL Environment" from dropdown
5. Run "Register" or "Login" to get started
```

## Compare the Schemas

### In GraphQL Playground:
1. Start server with vulnerable schema: `npm run dev`
2. Open http://localhost:4000/graphql
3. Check "Docs" tab - you'll see generic types (String, Int, Float)
4. Stop server (Ctrl+C)
5. Start with secured schema: `GRAPHQL_SCHEMA=secured npm run dev`
6. Refresh Playground
7. Check "Docs" tab - you'll see custom scalars (Email, IBAN, Amount, etc.)

## Common Issues

| Problem | Solution |
|---------|----------|
| **Port 4000 in use** | Change `GRAPHQL_PORT` in .env or kill existing process |
| **MongoDB connection error** | Ensure MongoDB is running: `docker-compose up -d` in backend/docker |
| **Schema not switching** | Check server logs for "Loading GraphQL schema" message |
| **Authentication errors** | Verify TOKEN_USER_ACCESS_SECRET is set in .env |
| **TLS/HTTPS errors** | Run `cd ../app/certs && ./generate.sh` to create certificates |

## Next Steps

### For Security Testing
1. Run with vulnerable schema
2. Review vulnerabilities: [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)
3. Try exploitation queries in Playground
4. Run `./audit_report.sh` for interactive demo
5. Switch to secured schema and verify fixes

### For Development
1. Run with secured schema: `GRAPHQL_SCHEMA=secured npm run dev`
2. Read [README.md](./README.md) for full API documentation
3. Check [SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md) for examples
4. Review [schema/README.md](./schema/README.md) for schema details
5. Read maintenance guide in [README.md#maintenance-guide](./README.md#maintenance-guide)

### For Production
1. Set `GRAPHQL_SCHEMA=secured` in environment
2. Set `NODE_ENV=production`
3. Review [deployment checklist](./README.md#deployment-checklist)
4. Disable introspection and playground (see server.js)
5. Configure rate limiting and monitoring

## File Overview

```
backend/graphql/
├── QUICKSTART.md               ← You are here
├── README.md                   ← Full documentation
├── server.js                   ← Server entry point
├── schema/
│   ├── schema.graphql         ← Vulnerable (26.97%)
│   └── schema-secured.graphql ← Secured (90%+)
└── [resolvers, context, utils] ← Implementation
```

## Resources

- **Full Documentation**: [README.md](./README.md)
- **Sample Queries**: [SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md)
- **Security Audit**: [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) (723 lines)
- **Quick Reference**: [AUDIT_QUICK_REFERENCE.md](./AUDIT_QUICK_REFERENCE.md) (339 lines)
- **Schema Guide**: [schema/README.md](./schema/README.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## Help & Support

**GraphQL Playground not loading?**
- Check console for errors
- Verify port 4000 is not blocked by firewall
- Try HTTPS: https://localhost:4443/graphql

**Need to see example queries?**
- Open Playground at http://localhost:4000/graphql
- Click "Docs" tab on the right
- Browse available queries and mutations
- Check [SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md)

**Want to understand the security fixes?**
```bash
./audit_report.sh  # Interactive presentation
```

---

**Version**: 2.0.0  
**Updated**: February 17, 2026  
**Format**: Dual schema (vulnerable + secured)
