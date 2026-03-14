import { Router } from 'express';
import {
    createHealthCenterAppointment,
    getAdminAppointments,
    getAdminChildren,
    getAdminVaccineDoses,
    notifyHealthCenterAppointment,
    updateHealthCenterAppointment
} from '../controllers/adminController';
import { authenticate, requireRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, requireRoles('health-center', 'admin'));

router.get('/children', getAdminChildren);
router.get('/appointments', getAdminAppointments);
router.get('/vaccine-doses', getAdminVaccineDoses);
router.post('/appointments', createHealthCenterAppointment);
router.put('/appointments/:id', updateHealthCenterAppointment);
router.post('/appointments/:id/notify', notifyHealthCenterAppointment);

export default router;
