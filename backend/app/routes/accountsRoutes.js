import express from 'express';
import { authenticateToken } from "../middleware/authHandlers.js";
import { handleMethodNotAllowed } from '../middleware/errorHandlers.js';
import {     
    getAccounts,
    deleteAccount,
    updateAccountOptions,
    getBalance,
    getPayeeList,
    createPayee,
    deletePayee,
    createTransferPayment,
    createBillPayment,
    getTransactionList,
    getTransactionListHeaders,
    createCardApplication,
    getCardApplication,
    modifyCardApplication,
    deleteCardApplication,
    createMeeting,
    createFile,
    getFile
 } from '../controllers/accountsController.js';

const router  = express.Router();

router.route('/')
    .get(authenticateToken, getAccounts)
    .delete(authenticateToken, deleteAccount)
    .put(authenticateToken, updateAccountOptions)
    .all(handleMethodNotAllowed)

router.route('/balances')
    .get(authenticateToken, getBalance)
    .all(handleMethodNotAllowed)

router.route('/payees')
    .get(authenticateToken, getPayeeList)
    .post(authenticateToken, createPayee)
    .all(handleMethodNotAllowed)

router.route('/payees/:PayeeId')
    .delete(authenticateToken, deletePayee)
    .all(handleMethodNotAllowed)

router.route('/payments/transfer')
    .post(authenticateToken, createTransferPayment)
    .all(handleMethodNotAllowed)

router.route('/payments/bill')
    .post(authenticateToken, createBillPayment)
    .all(handleMethodNotAllowed)

router.route('/transactions')
    .get(authenticateToken, getTransactionList)
    .head(authenticateToken, getTransactionListHeaders)
    .all(handleMethodNotAllowed)

router.route('/products/cards')
    .get(authenticateToken, getCardApplication)
    .post(authenticateToken, createCardApplication)
    .all(handleMethodNotAllowed)

router.route('/products/cards/:referenceId')
    .put(authenticateToken, modifyCardApplication)
    .delete(authenticateToken, deleteCardApplication)
    .all(handleMethodNotAllowed)

router.route('/products/mortgages/meeting')
    .post(authenticateToken, createMeeting)
    .all(handleMethodNotAllowed)

router.route('/files')
    .post(authenticateToken, createFile)
    .get(authenticateToken, getFile)
    .all(handleMethodNotAllowed)

export default router;