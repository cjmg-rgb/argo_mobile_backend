import { Router } from 'express';
import { createCar, editCar, getCars } from '../controllers/car.controller';
import { protectRoute } from '../middlewares/protect.route';

const router = Router();

// @POST - private - /api/cars
router.post('/', protectRoute(['admin']), createCar);

// @GET - private - /api/cars
router.get('/', protectRoute(['admin', 'user']), getCars);

// @PATCH - private - /api/cars/:carId
router.patch('/:carId', protectRoute(['admin']), editCar);

export default router;
