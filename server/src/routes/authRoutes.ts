import { Router } from 'express';
import { getProfile, login, register } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);

export default router;