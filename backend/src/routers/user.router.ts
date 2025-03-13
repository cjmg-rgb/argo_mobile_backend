import { Router } from 'express';
import { protectRoute } from '../middlewares/protect.route';
import { changePassword, createUser, editUser, getCurrentUser, getUsers } from '../controllers/user.controller';

const router = Router();

// @POST - private - /api/users
router.post('/', protectRoute(['admin']), createUser);

// @GET - private - /api/users
router.get('/', protectRoute(['admin']), getUsers);

// @GET - private - /api/users/me
router.get('/me', protectRoute(['admin', 'user']), getCurrentUser);

// @PATCH - private - /api/users/change-password
router.patch('/change-password', protectRoute(['admin', 'user']), changePassword);

// @PATCH - private - /api/users
router.patch('/:userId', protectRoute(['admin']), editUser);

export default router;
