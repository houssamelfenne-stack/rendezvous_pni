import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

export default router;