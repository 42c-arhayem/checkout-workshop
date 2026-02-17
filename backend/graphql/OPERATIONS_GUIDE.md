# GraphQL API - Operations & Maintenance Guide

Quick reference for developers working with the 42c Banking GraphQL API.

## Daily Operations

### Starting the Server

```bash
# Development with auto-reload (vulnerable schema)
npm run dev

# Development with secured schema
GRAPHQL_SCHEMA=secured npm run dev

# Production mode
NODE_ENV=production GRAPHQL_SCHEMA=secured npm start
```

### Checking Server Status

**Server logs show which schema is loaded:**
```
🚀 Loading GraphQL schema: schema-secured.graphql
   Version: 🛡️  SECURED (90%+ score)
   To switch: Set GRAPHQL_SCHEMA=secured or GRAPHQL_SCHEMA=vulnerable

🚀 GraphQL server ready at http://localhost:4000/graphql
🔒 GraphQL server (HTTPS) ready at https://localhost:4443/graphql
```

**Health Check:**
```bash
curl http://localhost:4000/graphql -d '{"query":"{__typename}"}' -H "Content-Type: application/json"
# Should return: {"data":{"__typename":"Query"}}
```

### Switching Schemas

| Method | Command | Persistence |
|--------|---------|-------------|
| **Inline** | `GRAPHQL_SCHEMA=secured npm run dev` | Current run only |
| **Export** | `export GRAPHQL_SCHEMA=secured && npm run dev` | Terminal session |
| **.env File** | Add `GRAPHQL_SCHEMA=secured` to .env | Permanent |

## Schema Management

### Viewing Schema Documentation

1. Start server (any version)
2. Open http://localhost:4000/graphql
3. Click "Docs" tab on the right side
4. Browse types, queries, and mutations

### Comparing Schemas

**In Playground:**
```bash
# Terminal 1: Vulnerable
GRAPHQL_SCHEMA=vulnerable npm run dev

# Check Playground - you'll see: String, Int, Float

# Terminal 1: Ctrl+C to stop

# Terminal 1: Secured
GRAPHQL_SCHEMA=secured npm run dev

# Check Playground - you'll see: Email, IBAN, Amount, CustomString, etc.
```

**Via File Diff:**
```bash
# Compare the two schemas
diff schema/schema.graphql schema/schema-secured.graphql

# Or use your IDE's diff tool
```

### Testing Queries

**Quick Test in Terminal:**
```bash
# Register
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{register(input:{name:\"Test\",email:\"test@test.com\",postalAddress:{country:\"UK\",postCode:\"SW1A1AA\"},pan:\"pass123\",accountType:\"personal\"}){message accountId}}"}'

# Login
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{login(input:{email:\"test@test.com\",pan:\"pass123\"}){access}}"}'
```

**Better: Use GraphQL Playground**
- More readable
- Syntax highlighting
- Autocomplete
- Documentation explorer

## Maintenance Tasks

### Adding a New Query/Mutation

#### 1. Update Vulnerable Schema
**File:** `schema/schema.graphql`
```graphql
type Query {
  # Add your new query
  getStatement(month: String!): Statement!
}
```

#### 2. Update Secured Schema
**File:** `schema/schema-secured.graphql`
```graphql
type Query {
  # Add your new query with validation
  getStatement(
    month: CustomString! @stringValue(pattern: "^[0-9]{4}-[0-9]{2}$")
  ): Statement! @cost(weight: 15)
}

# Define response type with validated fields
type Statement {
  accountId: CustomID! @cost(weight: 1)
  month: CustomString! @cost(weight: 1)
  transactions: [Transaction!]! @list(minItems: 0, maxItems: 1000) @cost(weight: 10)
  totalDebit: Amount @numberValue(min: 0, max: 999999999.99) @cost(weight: 1)
  totalCredit: Amount @numberValue(min: 0, max: 999999999.99) @cost(weight: 1)
}
```

#### 3. Create Resolver
**File:** `resolvers/accountResolvers.js` (or appropriate category)
```javascript
getStatement: async (_, { month }, { account }) => {
  // Authorization check
  if (!account) {
    throw new Error('Unauthorized');
  }

  // Input validation (extra layer beyond schema)
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error('Invalid month format. Use YYYY-MM');
  }

  // Business logic
  const [year, monthNum] = month.split('-');
  const transactions = await Transaction.find({
    userId: account._id,
    createdAt: {
      $gte: new Date(year, monthNum - 1, 1),
      $lt: new Date(year, monthNum, 1)
    }
  });

  // Calculate totals
  const totalDebit = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const totalCredit = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    accountId: account._id.toString(),
    month,
    transactions,
    totalDebit,
    totalCredit
  };
}
```

#### 4. Test Both Versions
```bash
# Test vulnerable
GRAPHQL_SCHEMA=vulnerable npm run dev
# Try query in Playground

# Test secured
GRAPHQL_SCHEMA=secured npm run dev
# Try query with invalid input to verify validation works
# Try query with valid input
```

#### 5. Update Documentation
- Add example to `SAMPLE_QUERIES.md`
- Update API documentation in `README.md`
- Add to Postman collection if needed

### Modifying Existing Functionality

**Checklist:**
- [ ] Update vulnerable schema (`schema/schema.graphql`)
- [ ] Update secured schema with validation (`schema/schema-secured.graphql`)
- [ ] Update resolver logic (`resolvers/*Resolvers.js`)
- [ ] Update tests
- [ ] Test with both schemas
- [ ] Update `SAMPLE_QUERIES.md`
- [ ] Update Postman collection
- [ ] Run security audit if changing secured schema

### Debugging Common Issues

#### Issue: Schema Not Switching

**Symptoms:**
- Server logs show wrong schema
- Playground shows wrong types

**Solutions:**
```bash
# Check environment variable
echo $GRAPHQL_SCHEMA

# Clear and restart
unset GRAPHQL_SCHEMA
export GRAPHQL_SCHEMA=secured
npm run dev

# Check .env file
cat .env | grep GRAPHQL_SCHEMA
```

#### Issue: Custom Scalar Validation Errors

**Symptoms:**
- Getting validation errors like "Invalid value for CustomString"

**Cause:**
- Using secured schema with strict validation

**Solutions:**
- **If this is expected:** Good! Validation is working. Fix your input.
- **If you need loose validation:** Switch to vulnerable schema for testing
  ```bash
  GRAPHQL_SCHEMA=vulnerable npm run dev
  ```

#### Issue: Resolver Doesn't Work with Both Schemas

**Cause:**
- Resolver might be hardcoded to expect certain types

**Solution:**
- Resolvers should work with both schemas
- They receive plain JavaScript values, not GraphQL types
- Schema handles validation BEFORE resolver is called

```javascript
// ✅ GOOD: Works with both schemas
createPayment: async (_, { input }, { account }) => {
  // input.amount is already a number (validated by schema)
  // input.iban is already a string (validated by secured schema)
  const payment = await Payment.create({
    userId: account._id,
    ...input
  });
  return payment;
}

// ❌ BAD: Assumes specific type validation
createPayment: async (_, { input }, { account }) => {
  // Don't do custom IBAN validation here if using secured schema
  // The schema already validated it
  if (!/^[A-Z]{2}/.test(input.iban)) {
    throw new Error('Invalid IBAN');
  }
  // ...
}
```

## Security Operations

### Running Security Audit

```bash
# Using 42Crunch CLI (if installed)
42c audit schema/schema.graphql > schema/audit-report.json
42c audit schema/schema-secured.graphql > schema/audit-report-secured.json

# Compare scores
cat schema/audit-report.json | jq '.data.score'
cat schema/audit-report-secured.json | jq '.data.score'
```

### Viewing Security Documentation

```bash
# Interactive demo (color-coded, step-by-step)
./audit_report.sh

# Read comprehensive report (723 lines)
less SECURITY_AUDIT_REPORT.md

# Quick reference
less AUDIT_QUICK_REFERENCE.md
```

### Testing Vulnerabilities

**With Vulnerable Schema:**
```bash
# Start vulnerable version
GRAPHQL_SCHEMA=vulnerable npm run dev

# Test exploits in Playground
# See SECURITY_AUDIT_REPORT.md for specific queries
```

**With Secured Schema:**
```bash
# Start secured version
GRAPHQL_SCHEMA=secured npm run dev

# Try the same exploits - they should be blocked
# Validation errors confirm protections are working
```

## Monitoring & Logging

### Enabling Detailed Logs

**Edit `server.js`:**
```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  formatError: (error) => {
    console.log('GraphQL Error:', error.message);
    console.log('Path:', error.path);
    console.log('Extensions:', error.extensions); // Add this
    return {
      message: error.message,
      path: error.path,
    };
  },
  debug: true, // Add this for development
});
```

### Query Complexity Monitoring

**With Secured Schema (@cost directives):**
- Each query/mutation has a complexity score
- Monitor these in production
- Set limits based on your infrastructure

**Common Costs:**
- Simple query (getAccount): 10 points
- List query (getTransactionList): 20 points
- Mutation (createPayment): 25 points
- Dangerous operation (deleteAccount): 30 points

**Recommended limits:**
- Development: Unlimited
- Staging: 1000 points per query
- Production: 500 points per query

## Deployment

### Pre-Deployment Checklist

**Configuration:**
- [ ] `GRAPHQL_SCHEMA=secured` set in production environment
- [ ] `NODE_ENV=production` set
- [ ] JWT secret updated (`TOKEN_USER_ACCESS_SECRET`)
- [ ] TLS certificates configured properly
- [ ] MongoDB connection string configured
- [ ] Port configuration verified (4000 for HTTP, 4443 for HTTPS)

**Security:**
- [ ] Introspection disabled in production (`introspection: false` in server.js)
- [ ] Playground disabled in production (`playground: false` in server.js)
- [ ] CORS configured appropriately
- [ ] Rate limiting configured
- [ ] Query complexity limits set

**Testing:**
- [ ] All queries tested with secured schema
- [ ] Security audit passed (90%+ score)
- [ ] Load testing completed
- [ ] Monitoring configured

### Deployment Commands

**Docker:**
```bash
# Build
docker build -t 42c-banking-graphql .

# Run with secured schema
docker run -e GRAPHQL_SCHEMA=secured -p 4000:4000 42c-banking-graphql
```

**Docker Compose:**
```bash
# Edit docker-compose.yml to add:
# environment:
#   - GRAPHQL_SCHEMA=secured
#   - NODE_ENV=production

docker-compose up -d
```

## Quick Reference

### File Locations

| What | Where |
|------|-------|
| **Server Entry** | `server.js` |
| **Vulnerable Schema** | `schema/schema.graphql` |
| **Secured Schema** | `schema/schema-secured.graphql` |
| **Resolvers** | `resolvers/*.js` |
| **Auth Context** | `context/auth.js` |
| **Environment Config** | `.env` or `../app/.env` |
| **Quick Start Guide** | `QUICKSTART.md` |
| **Full Documentation** | `README.md` |
| **Security Audit** | `SECURITY_AUDIT_REPORT.md` |
| **Sample Queries** | `SAMPLE_QUERIES.md` |

### Common Commands

```bash
# Install
npm install

# Run vulnerable (default)
npm run dev

# Run secured
GRAPHQL_SCHEMA=secured npm run dev

# Production
NODE_ENV=production GRAPHQL_SCHEMA=secured npm start

# Check which schema is loaded
# (Look for "Loading GraphQL schema:" in server output)

# Interactive security demo
./audit_report.sh

# Compare schemas
diff schema/schema.graphql schema/schema-secured.graphql
```

### Environment Variables

| Variable | Values | Default | Purpose |
|----------|--------|---------|---------|
| `GRAPHQL_SCHEMA` | `vulnerable` \| `secured` | `vulnerable` | Choose schema version |
| `GRAPHQL_PORT` | Number | `4000` | HTTP port |
| `NODE_ENV` | `development` \| `production` | `development` | Runtime environment |
| `TOKEN_USER_ACCESS_SECRET` | String | (required) | JWT secret |
| `MONGODB_URI` | String | (required) | Database connection |

---

**Last Updated:** February 17, 2026  
**Version:** 2.0.0  
**Contact:** See main README.md for support information
