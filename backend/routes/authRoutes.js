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
    // BUG: OWASP API8 (Security Misconfiguration)
    // Description: be specific about which HTTP verbs the API does not support
    // Solution:
    // .all(handleMethodNotAllowed)

export default router;