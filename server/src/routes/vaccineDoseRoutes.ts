import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getChildVaccineDoses, upsertChildVaccineDose } from '../controllers/vaccineDoseController';

const router = Router();

router.get('/child/:childId', authenticate, getChildVaccineDoses);
router.put('/child/:childId', authenticate, upsertChildVaccineDose);

export default router;