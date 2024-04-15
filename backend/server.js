import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/accountsRoutes.js';
import authRoutes from './routes/authRoutes.js'
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const PORT = process.env.PORT || 3000;
const SERVER = express();

SERVER.use(express.json());

SERVER.use('/apis/banking/account', accountRoutes);
SERVER.use('/apis/banking/auth', authRoutes);

SERVER.use(function(req, res) {
    res.status(404).json({"message": "Not Found"});
});

SERVER.listen(PORT, () => console.log('Server started.'));