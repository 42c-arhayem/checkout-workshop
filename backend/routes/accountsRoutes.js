import express from 'express';
import {     
    createAccount,
    getAccounts,
    getAccount,
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
    deleteCardApplication } from '../controllers/accountsController.js';
import { authenticateToken } from "../auth/tokens.js";

const router  = express.Router();

router.post('/', createAccount );
router.get('/', authenticateToken, getAccounts);
router.get('/:AccountId', authenticateToken, getAccount );
router.delete('/:AccountId', authenticateToken, deleteAccount );
router.get('/:AccountId/balances', authenticateToken, getBalance);
router.get('/:AccountId/payees', authenticateToken, getPayeeList );
router.post('/:AccountId/payees', authenticateToken, createPayee );
router.delete('/:AccountId/payees/:PayeeId', authenticateToken, deletePayee );
router.post('/:AccountId/payments', authenticateToken, createPayment );
router.get('/:AccountId/transactions', authenticateToken, getTransactionList);
router.post('/:AccountId/products/cards', createCardApplication );
router.get('/:AccountId/products/cards/:CardApplicationId', getCardApplication);
router.put('/:AccountId/products/cards/:CardApplicationId', modifyCardApplication);
router.delete('/:AccountId/products/cards/:CardApplicationId', deleteCardApplication );


export default router;