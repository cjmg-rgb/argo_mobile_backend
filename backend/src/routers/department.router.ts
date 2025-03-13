import { Router } from 'express';
import { getDepartments } from '../controllers/department.controller';
import { protectRoute } from '../middlewares/protect.route';

const router = Router();

// @GET - private - /api/departments
router.get('/', protectRoute(['admin']), getDepartments);

export default router;
