# GraphQL API Documentation Index

**Welcome to the 42c Banking GraphQL API!** This index helps you find the right documentation for your needs.

## 🚀 I Want To...

### Get Started Quickly
→ **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes

### Understand the Full API
→ **[README.md](./README.md)** - Complete API documentation with all queries, mutations, and examples

### Learn About Security
→ **[SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)** - 723-line comprehensive security audit  
→ **[AUDIT_QUICK_REFERENCE.md](./AUDIT_QUICK_REFERENCE.md)** - Quick reference for security fixes  
→ Run `./audit_report.sh` for interactive security presentation

### See Example Queries
→ **[SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md)** - Copy-paste ready GraphQL queries

### Understand the Implementation
→ **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Full implementation details and project structure

### Operate & Maintain the API
→ **[OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md)** - Daily operations, maintenance, debugging, deployment

### Work with Schemas
→ **[schema/README.md](./schema/README.md)** - Schema documentation and comparison

---

## 📚 Documentation by Use Case

### For Developers New to This Project

**Start here:**
1. [QUICKSTART.md](./QUICKSTART.md) - Get server running
2. [README.md](./README.md) - Understand the API
3. [SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md) - Try example queries
4. [OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md) - Learn daily workflows

**Then explore:**
- [schema/README.md](./schema/README.md) - Schema versions explained
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Architecture details

### For Security Researchers / Testers

**Vulnerability Testing:**
1. [QUICKSTART.md](./QUICKSTART.md) - Get server running with vulnerable schema
2. [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Detailed vulnerability analysis
3. [AUDIT_QUICK_REFERENCE.md](./AUDIT_QUICK_REFERENCE.md) - Quick vulnerability reference
4. Run `./audit_report.sh` - Interactive demo of vulnerabilities

**Understanding Fixes:**
- Compare `schema/schema.graphql` vs `schema/schema-secured.graphql`
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) has before/after code for each fix

### For DevOps / Production Deployment

**Deployment:**
1. [OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md) - Deployment checklist and commands
2. [README.md#deployment-checklist](./README.md#deployment-checklist) - Pre-flight checks
3. [schema/README.md](./schema/README.md) - Ensure using secured schema

**Monitoring:**
- [OPERATIONS_GUIDE.md#monitoring--logging](./OPERATIONS_GUIDE.md#monitoring--logging)
- [README.md#maintenance-guide](./README.md#maintenance-guide)

### For API Consumers (Frontend Developers)

**Integration:**
1. [README.md#getting-started](./README.md#getting-started) - Server endpoints
2. [README.md#authentication](./README.md#authentication) - Auth flow
3. [SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md) - All available operations
4. GraphQL Playground (http://localhost:4000/graphql) - Interactive schema explorer

**Schema:**
- Introspect the live schema in GraphQL Playground
- [schema/schema-secured.graphql](./schema/schema-secured.graphql) - Production schema
- Auto-generate types using tools like `graphql-codegen`

### For Maintainers / Contributors

**Daily Work:**
1. [OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md) - Complete operations reference
2. [README.md#maintenance-guide](./README.md#maintenance-guide) - Adding features
3. [schema/README.md](./schema/README.md) - Schema modification guide

**Architecture:**
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Project structure
- [README.md#architecture](./README.md#architecture) - File organization

---

## 📖 All Documentation Files

### Core Documentation
| File | Lines | Purpose |
|------|-------|---------|
| **[QUICKSTART.md](./QUICKSTART.md)** | ~200 | Get started in 5 minutes |
| **[README.md](./README.md)** | ~650 | Complete API reference |
| **[OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md)** | ~500 | Operations & maintenance |
| **[SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md)** | ~400 | Example queries |

### Security Documentation
| File | Lines | Purpose |
|------|-------|---------|
| **[SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)** | 723 | Complete vulnerability analysis |
| **[AUDIT_QUICK_REFERENCE.md](./AUDIT_QUICK_REFERENCE.md)** | 339 | Quick security reference |
| **[audit_report.sh](./audit_report.sh)** | ~300 | Interactive security demo |

### Technical Documentation
| File | Lines | Purpose |
|------|-------|---------|
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | ~350 | Implementation details |
| **[schema/README.md](./schema/README.md)** | ~200 | Schema documentation |
| **[REST_VS_GRAPHQL.md](./REST_VS_GRAPHQL.md)** | ~250 | REST vs GraphQL comparison |

### Schema Files
| File | Lines | Purpose |
|------|-------|---------|
| **[schema/schema.graphql](./schema/schema.graphql)** | ~200 | Vulnerable schema (26.97%) |
| **[schema/schema-secured.graphql](./schema/schema-secured.graphql)** | ~313 | Production schema (90%+) |

---

## 🔍 Find Information By Topic

### Authentication
- [README.md#authentication](./README.md#authentication)
- [SAMPLE_QUERIES.md#authentication](./SAMPLE_QUERIES.md)
- [OPERATIONS_GUIDE.md#testing-queries](./OPERATIONS_GUIDE.md#testing-queries)

### Schema Switching
- [QUICKSTART.md#switching-between-schemas](./QUICKSTART.md#switching-between-schemas)
- [README.md#switching-between-schema-versions](./README.md#switching-between-schema-versions)
- [OPERATIONS_GUIDE.md#switching-schemas](./OPERATIONS_GUIDE.md#switching-schemas)
- [schema/README.md](./schema/README.md)

### Security Vulnerabilities
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Detailed analysis
- [AUDIT_QUICK_REFERENCE.md](./AUDIT_QUICK_REFERENCE.md) - Quick lookup
- [README.md#security-notes](./README.md#security-notes)

### Custom Scalars & Directives
- [AUDIT_QUICK_REFERENCE.md#custom-scalar-types](./AUDIT_QUICK_REFERENCE.md#custom-scalar-types)
- [AUDIT_QUICK_REFERENCE.md#security-directives](./AUDIT_QUICK_REFERENCE.md#security-directives)
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Usage examples

### Query Examples
- [SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md) - All examples
- [README.md#example-queries-and-mutations](./README.md#example-queries-and-mutations)
- [QUICKSTART.md#first-api-calls](./QUICKSTART.md#first-api-calls)

### Adding Features
- [OPERATIONS_GUIDE.md#adding-a-new-querymutation](./OPERATIONS_GUIDE.md#adding-a-new-querymutation)
- [README.md#maintenance-guide](./README.md#maintenance-guide)
- [schema/README.md#editing-the-schemas](./schema/README.md#editing-the-schemas)

### Deployment
- [OPERATIONS_GUIDE.md#deployment](./OPERATIONS_GUIDE.md#deployment)
- [README.md#deployment-checklist](./README.md#deployment-checklist)
- [QUICKSTART.md#deployment-checklist](./QUICKSTART.md)

### Troubleshooting
- [OPERATIONS_GUIDE.md#debugging-common-issues](./OPERATIONS_GUIDE.md#debugging-common-issues)
- [QUICKSTART.md#common-issues](./QUICKSTART.md#common-issues)
- [README.md#maintenance-guide](./README.md#maintenance-guide)

---

## 🎯 Quick Commands Reference

```bash
# Get started
cd backend/graphql && npm install && npm run dev

# Run secured schema
GRAPHQL_SCHEMA=secured npm run dev

# Access playground
open http://localhost:4000/graphql

# View security demo
./audit_report.sh

# Compare schemas
diff schema/schema.graphql schema/schema-secured.graphql
```

---

## 💡 Tips

- **New to GraphQL?** Start with [QUICKSTART.md](./QUICKSTART.md)
- **Need examples?** Check [SAMPLE_QUERIES.md](./SAMPLE_QUERIES.md)
- **Learning security?** Run `./audit_report.sh` for interactive demo
- **Deploying to production?** Read [OPERATIONS_GUIDE.md#deployment](./OPERATIONS_GUIDE.md#deployment)
- **Stuck?** Check [OPERATIONS_GUIDE.md#debugging-common-issues](./OPERATIONS_GUIDE.md#debugging-common-issues)

---

## 📞 Support

- **Issues:** Create an issue in the GitHub repository
- **Questions:** Check existing documentation using this index
- **Security:** Review [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)

---

**Version:** 2.0.0  
**Last Updated:** February 17, 2026  
**Format:** Dual schema (vulnerable + secured)
