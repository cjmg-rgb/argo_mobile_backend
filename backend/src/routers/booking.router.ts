import { Router } from 'express';
import { createBooking, deleteBooking, editBooking, getAllBookings, getBookingReports, getCurrentUserBookings } from '../controllers/booking.controller';
import { protectRoute } from '../middlewares/protect.route';

const router = Router();

// @POST - private - /api/bookings
router.post('/', protectRoute(['admin', 'user']), createBooking);

// @GET - private - /api/bookings
router.get('/', protectRoute(['admin', 'user']), getAllBookings);

// @GET - private - /api/bookings/reports
router.get('/reports', protectRoute(['admin']), getBookingReports);

// @PATCH - private - /api/bookings/:bookingId
router.patch('/:bookingId', protectRoute(['admin', 'user']), editBooking);

// @GET - private - /api/bookings/my-bookings
router.get('/my-bookings', protectRoute(['admin', 'user']), getCurrentUserBookings);

// @DELETE - private - /api/bookings/:bookingId
router.delete('/:bookingId', protectRoute(['admin', 'user']), deleteBooking);

export default router;
