import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointment, deleteAppointment } from '../controllers/appointmentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new appointment
router.post('/', authenticate, createAppointment);

// Route to get all appointments for the authenticated user
router.get('/', authenticate, getAppointments);

// Route to update an existing appointment
router.put('/:id', authenticate, updateAppointment);

// Route to delete an appointment
router.delete('/:id', authenticate, deleteAppointment);

export default router;