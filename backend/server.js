import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/accountsRoutes.js';
import authRoutes from './routes/authRoutes.js'
import { handleRouteNotFound, handleError } from './middleware/errorHandlers.js';
import { logRequest } from './middleware/logger.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const PORT = process.env.PORT || 3000;
const SERVER = express();

SERVER.use(express.json());

SERVER.use(logRequest);

SERVER.use('/apis/banking/v1/account', accountRoutes);
SERVER.use('/apis/banking/v1/auth', authRoutes);

SERVER.use(handleRouteNotFound);
SERVER.use(handleError);

SERVER.listen(PORT, () => console.log('Server started.'));