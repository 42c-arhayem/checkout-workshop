import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import accountRoutes from './routes/accountsRoutes.js';
import authRoutes from './routes/authRoutes.js'
import { handleRouteNotFound, handleError } from './middleware/errorHandlers.js';
import { logRequest } from './middleware/logger.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const privateKey = fs.readFileSync(join(__dirname, "certs", "key.pem"), 'utf8');
const certificate = fs.readFileSync(join(__dirname, "certs", "cert.pem"), 'utf8');

const credentials = { 
    key: privateKey,
    passphrase: process.env.TLS_PASSPHRASE,
    cert: certificate
}

const PORT = process.env.PORT || 3000;
const SERVER = express();
const HTTPS_SERVER = https.createServer(credentials, SERVER);
const ADMIN_SERVER = express();

SERVER.use(express.json());
SERVER.use(logRequest);

SERVER.use('/apis/banking/v1/account', accountRoutes);
SERVER.use('/apis/banking/v1/auth', authRoutes);

SERVER.use(handleRouteNotFound);
SERVER.use(handleError);

SERVER.listen(PORT, () => console.log(`API server started on port ${PORT}` ));
HTTPS_SERVER.listen(443, () => console.log('API server with HTTPS started on port 443'));

// access on localhost only. DO NOT EXPOSE PUBLICLY!!
ADMIN_SERVER.use(express.static('/'));
ADMIN_SERVER.listen(8888, ()=>{})