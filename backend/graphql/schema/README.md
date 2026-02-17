# GraphQL Schema Documentation

## 📁 Schema Files

This directory contains **two complete GraphQL schema versions**:

### 1. `schema.graphql` - Vulnerable Version (26.97% Security Score)
- **Purpose**: Security testing, education, vulnerability demonstrations
- **Status**: Intentionally vulnerable with 10 critical security issues
- **Use Case**: 
  - Testing with 42Crunch API Security platform
  - Security training and education
  - Learning about GraphQL vulnerabilities
  - CI/CD security scanning demonstrations

### 2. `schema-secured.graphql` - Production Version (90%+ Security Score)
- **Purpose**: Production deployment
- **Status**: Fully hardened with comprehensive security controls
- **Features**:
  - 10 custom scalar types with validation (Email, PAN, IBAN, Amount, Currency, DateTime, etc.)
  - 4 security directives (@stringValue, @numberValue, @list, @cost)
  - All OWASP API Security Top 10 vulnerabilities fixed
  - Query complexity controls (max 1000 points recommended)
  - Collection size limits (max 10,000 items)
  - Input validation with regex patterns
  - Range constraints on numeric values

### 3. `audit-report.json` - Security Analysis
- 42Crunch API Security audit results
- Detailed vulnerability findings
- Used for CI/CD pipeline security gates

## 🔄 Switching Between Schemas

The server automatically loads the appropriate schema based on the `GRAPHQL_SCHEMA` environment variable:

```javascript
// server.js
const schemaVersion = process.env.GRAPHQL_SCHEMA || 'vulnerable';
const schemaFile = schemaVersion === 'secured' ? 'schema-secured.graphql' : 'schema.graphql';
const typeDefs = readFileSync(join(__dirname, 'schema', schemaFile), 'utf-8');
```

**To switch schemas:**

```bash
# Run with vulnerable schema (default)
GRAPHQL_SCHEMA=vulnerable npm run dev

# Run with secured schema
GRAPHQL_SCHEMA=secured npm run dev
```

## 🔐 Security Comparison

| Feature | Vulnerable Schema | Secured Schema |
|---------|-------------------|----------------|
| **Security Score** | 26.97% | 90%+ |
| **Custom Scalars** | 0 | 10 |
| **Input Validation** | None | Pattern + Length |
| **Query Complexity** | Unlimited | Cost-based budgeting |
| **Collection Limits** | None | @list directive |
| **BOLA Protection** | ❌ | ✅ |
| **DOS Protection** | ❌ | ✅ |
| **Injection Prevention** | ❌ | ✅ |
| **SSRF Protection** | ❌ | ✅ |
| **Production Ready** | ❌ | ✅ |

## 📚 Security Documentation

For detailed information about the security improvements:

1. **[../SECURITY_AUDIT_REPORT.md](../SECURITY_AUDIT_REPORT.md)** - Complete vulnerability analysis
   - All 10 vulnerabilities explained with code examples
   - Before/after comparisons
   - Remediation steps
   - OWASP API Security mapping
   - 723 lines of comprehensive documentation

2. **[../AUDIT_QUICK_REFERENCE.md](../AUDIT_QUICK_REFERENCE.md)** - Quick reference guide
   - At-a-glance security improvements
   - Custom scalar definitions
   - Security directive usage
   - Query complexity costs
   - Validation examples

3. **[../audit_report.sh](../audit_report.sh)** - Interactive presentation
   - Run `./backend/graphql/audit_report.sh`
   - Step-by-step walkthrough of all fixes
   - Color-coded output
   - Perfect for demos and training

## 💡 Benefits of This Approach

✅ **Pure SDL Format** - Standard GraphQL Schema Definition Language  
✅ **Easy Switching** - Toggle between versions with one environment variable  
✅ **No Rebuilds** - Just restart server to switch schemas  
✅ **Better Syntax Highlighting** - Full editor support for .graphql files  
✅ **No Build Step** - Direct file reading, no compilation needed  
✅ **Easy to Share** - Share schema files with frontend teams  
✅ **Tool Compatible** - Works with GraphQL codegen, Apollo Studio, etc.  
✅ **Version Control Friendly** - Clean diffs for schema changes  
✅ **Educational** - Compare vulnerable vs secured side-by-side  

## ✏️ Editing the Schemas

### Modifying the Vulnerable Schema (for testing)

1. Edit `schema/schema.graphql`
2. Add/modify types, queries, or mutations
3. Save the file
4. Run `GRAPHQL_SCHEMA=vulnerable npm run dev`
5. Update resolvers in `resolvers/` as needed
6. Test vulnerabilities with 42Crunch audit

### Modifying the Secured Schema (for production)

1. Edit `schema/schema-secured.graphql`
2. When adding new fields:
   - Use custom scalars (CustomString, Email, Amount, etc.)
   - Add appropriate directives (@stringValue, @numberValue, @cost)
   - Set collection limits with @list
   - Define min/max constraints
3. Save the file
4. Run `GRAPHQL_SCHEMA=secured npm run dev`
5. Update resolvers in `resolvers/` as needed
6. Run security audit to verify improvements

**Example of properly secured field:**
```graphql
type Mutation {
  createPayment(
    amount: Amount! @numberValue(min: 0.01, max: 999999999.99)
    iban: IBAN!
    description: CustomString
  ): Payment! @cost(weight: 25)
}
```

## Alternative Approaches

### Option: Using graphql-tag loader (for multiple schema files)

If you need to split schema across multiple files:Install `@graphql-tools/load-files`:
```bash
npm install @graphql-tools/load-files @graphql-tools/schema
```

Then:
```javascript
// schema/typeDefs.js
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typesArray = loadFilesSync(join(__dirname, '**/*.graphql'));
const typeDefs = mergeTypeDefs(typesArray);

export default typeDefs;
```

## Current Setup

The server currently uses the JavaScript format (`typeDefs.js`) for simplicity and zero additional dependencies. Both files contain identical schema definitions and are kept in sync.

## Schema Introspection

When the GraphQL server is running, you can export the schema in various formats:

### Export Schema JSON
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

### Using GraphQL Playground
1. Start the server: `npm run dev`
2. Open http://localhost:4000/graphql
This allows splitting the schema into multiple `.graphql` files (types.graphql, queries.graphql, mutations.graphql, etc.).

## Schema Format

The schema file uses standard GraphQL SDL syntax:http://localhost:4000/graphql > schema.graphql
```

## Benefits of .graphql Files

✅ **Syntax Highlighting** - Better editor support  
✅ **Tooling** - Works with GraphQL codegen tools  
✅ **Sharing** - Easy to share with frontend teams  
✅ **Documentation** - Self-documenting format  
✅ **Version Control** - Clean diffs for schema changes  

## Keeping Files in Sync

If you modify the schema:
1. Update `schema.graphql` with the new types/fields
2. Update `typeDefs.js` to match (or configure to load from .graphql)
3. Update resolvers as needed
4. Test with GraphQL Playground
```graphql
# Comments start with #
type User {
  id: ID!           # Non-null field
  name: String!     # Required string
  email: String     # Optional string
  posts: [Post!]!   # Non-null array of non-null Posts
}
```

## Schema Introspection