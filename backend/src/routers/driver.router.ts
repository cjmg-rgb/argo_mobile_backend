import { Router } from 'express';
import { protectRoute } from '../middlewares/protect.route';
import { createDriver, deleteDriver, editDriver, getDrivers } from '../controllers/driver.controller';

const router = Router();

// @POST - private - /api/drivers
router.post('/', protectRoute(['admin']), createDriver);

// @GET - private - /api/drivers
router.get('/', protectRoute(['admin']), getDrivers);

// @PATCH - private /api/drivers/:driverId
router.patch('/:driverId', protectRoute(['admin']), editDriver);

// @DELETE - private - /api/drivers/:driverId
router.delete('/:driverId', protectRoute(['admin']), deleteDriver);

export default router;
