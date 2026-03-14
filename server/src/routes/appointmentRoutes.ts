import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointment, deleteAppointment } from '../controllers/appointmentController';
import { authenticate, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new appointment
router.post('/', authenticate, requireRoles('citizen'), createAppointment);

// Route to get all appointments for the authenticated user
router.get('/', authenticate, requireRoles('citizen'), getAppointments);

// Route to update an existing appointment
router.put('/:id', authenticate, requireRoles('citizen'), updateAppointment);

// Route to delete an appointment
router.delete('/:id', authenticate, requireRoles('citizen'), deleteAppointment);

export default router;