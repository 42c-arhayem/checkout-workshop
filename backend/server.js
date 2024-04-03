import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/accountsRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js'
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const PORT = process.env.PORT || 3000;
const SERVER = express();

SERVER.use(express.json());

SERVER.use('/apis/accounts', accountRoutes);
SERVER.use('/apis/tokens', tokenRoutes);

SERVER.listen(PORT, () => console.log('Server started.'));