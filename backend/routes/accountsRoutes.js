import express from 'express';
import { authenticateToken } from "../middleware/tokens.js";
import {     
    getAccounts,
    deleteAccount,
    getBalance,
    getPayeeList,
    createPayee,
    deletePayee,
    createPayment,
    getTransactionList,
    createCardApplication,
    getCardApplication,
    modifyCardApplication,
    deleteCardApplication
 } from '../controllers/accountsController.js';

const router  = express.Router();

router.get('/', authenticateToken, getAccounts);
router.delete('/', authenticateToken, deleteAccount );
router.get('/balances', authenticateToken, getBalance);
router.get('/payees', authenticateToken, getPayeeList );
router.post('/payees', authenticateToken, createPayee );
router.delete('/payees/:PayeeId', authenticateToken, deletePayee );
router.post('/payments', authenticateToken, createPayment );
router.get('/transactions', authenticateToken, getTransactionList);
router.post('/products/cards', authenticateToken, createCardApplication );
router.get('/products/cards', authenticateToken, getCardApplication);
router.put('/products/cards/:referenceId', authenticateToken, modifyCardApplication);
router.delete('/products/cards/:referenceId', authenticateToken, deleteCardApplication );


export default router;