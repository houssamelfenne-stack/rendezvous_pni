import { Router } from 'express';
import {
    createAdminChild,
    createAdminUser,
    deleteAdminAppointment,
    deleteAdminChild,
    deleteAdminUser,
    getAdminAppointments,
    getAdminChildren,
    getAdminUsers,
    updateAdminAppointment,
    updateAdminChild,
    updateAdminUser
} from '../controllers/adminController';
import { authenticate, requireRoles } from '../middleware/authMiddleware';
import { validateChild } from '../middleware/validationMiddleware';

const router = Router();

router.use(authenticate, requireRoles('super-admin'));

router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.put('/users/:id', updateAdminUser);
router.delete('/users/:id', deleteAdminUser);

router.get('/children', getAdminChildren);
router.post('/users/:userId/children', validateChild, createAdminChild);
router.put('/children/:id', validateChild, updateAdminChild);
router.delete('/children/:id', deleteAdminChild);

router.get('/appointments', getAdminAppointments);
router.put('/appointments/:id', updateAdminAppointment);
router.delete('/appointments/:id', deleteAdminAppointment);

export default router;