import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller';

const router = Router();

// @POST - public - /api/auth/login
router.post('/login', login);

// @POST - public - /api/auth/logout
router.post('/logout', logout);

export default router;
