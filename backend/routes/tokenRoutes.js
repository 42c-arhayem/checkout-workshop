import express from 'express';
import {
    createToken,
    refreshToken
} from '../controllers/tokenController.js'

const router = express.Router();

router.post('/new', createToken);
router.post('/refresh', refreshToken);

export default router;