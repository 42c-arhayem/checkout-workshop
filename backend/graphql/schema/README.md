# Using the GraphQL Schema

The GraphQL schema is maintained in pure GraphQL SDL format and loaded directly by the server.

## Schema File

**File**: `schema/schema.graphql`

This is the standard GraphQL Schema Definition Language format. The server reads this file directly in `server.js`:

```javascript
// server.js
import { readFileSync } from 'fs';

const typeDefs = readFileSync(join(__dirname, 'schema', 'schema.graphql'), 'utf-8');
```

## Benefits of This Approach

✅ **Pure SDL Format** - Maintain schema in standard GraphQL format  
✅ **No Middleman** - Server loads schema directly, no wrapper needed  
✅ **Better Syntax Highlighting** - Full editor support for .graphql files  
✅ **No Build Step** - Direct file reading, no compilation needed  
✅ **Easy to Share** - Share the schema file with frontend teams  
✅ **Tool Compatible** - Works with GraphQL codegen, Apollo Studio, etc.  
✅ **Single Source of Truth** - One file to maintain  

## Editing the Schema

To modify the schema:

1. Edit `schema/schema.graphql`
2. Add/modify types, queries, or mutations
3. Save the file
4. Restart the server (or nodemon will auto-reload)
5. Update resolvers in `resolvers/` as needed

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