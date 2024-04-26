import express from 'express';
import { handleMethodNotAllowed } from '../middleware/errorHandlers.js';
import {
    accountRegistration,
    accountLogin
} from '../controllers/authController.js'

const router = express.Router();

router.route('/register')
    .post(accountRegistration)
    .all(handleMethodNotAllowed)
    
router.route('/login')
    .post(accountLogin)
    .all(handleMethodNotAllowed)

export default router;