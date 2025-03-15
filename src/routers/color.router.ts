import { Router } from 'express';
import { getColors } from '../controllers/color.controller';
import { protectRoute } from '../middlewares/protect.route';

const router = Router();

// @GET - private - /api/colors
router.get('/', protectRoute(['admin']), getColors);

export default router;
