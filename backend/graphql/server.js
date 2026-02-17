import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import https from 'https';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../app/config/db.js';
import resolvers from './resolvers/index.js';
import context from './context/auth.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load GraphQL schema
const typeDefs = readFileSync(join(__dirname, 'schema', 'schema.graphql'), 'utf-8');

const privateKey = readFileSync(join(__dirname, "..", "app", "certs", "key.pem"), 'utf8');
const certificate = readFileSync(join(__dirname, "..", "app", "certs", "cert.pem"), 'utf8');

const credentials = {
  key: privateKey,
  passphrase: process.env.TLS_PASSPHRASE,
  cert: certificate
};

const PORT = process.env.GRAPHQL_PORT || 4000;
const app = express();
const httpsServer = https.createServer(credentials, app);

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  formatError: (error) => {
    console.log('GraphQL Error:', error.message);
    return {
      message: error.message,
      path: error.path,
    };
  },
  introspection: true, // Enable in development, disable in production
  playground: true,    // Enable in development, disable in production
});

// Start the server
async function startServer() {
  await server.start();
  
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: {
      origin: '*',
      credentials: true
    }
  });

  // HTTP server
  app.listen(PORT, () => {
    console.log(`🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });

  // HTTPS server
  httpsServer.listen(4443, () => {
    console.log(`🚀 GraphQL server with HTTPS ready at https://localhost:4443${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});

export default app;
