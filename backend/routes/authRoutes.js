import express from 'express';
import {
    accountRegistration,
    accountLogin
} from '../controllers/authController.js'

const router = express.Router();

router.post('/register', accountRegistration);
router.post('/login', accountLogin);

export default router;