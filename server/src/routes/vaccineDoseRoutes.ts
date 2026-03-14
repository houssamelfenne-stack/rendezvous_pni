import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/authMiddleware';
import { getChildVaccineDoses, getMyVaccineDoseNotifications, upsertChildVaccineDose } from '../controllers/vaccineDoseController';

const router = Router();

router.get('/notifications', authenticate, requireRoles('citizen'), getMyVaccineDoseNotifications);
router.get('/child/:childId', authenticate, requireRoles('citizen', 'health-center', 'admin'), getChildVaccineDoses);
router.put('/child/:childId', authenticate, requireRoles('citizen', 'health-center', 'admin'), upsertChildVaccineDose);

export default router;