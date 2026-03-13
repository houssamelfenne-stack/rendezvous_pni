import { Router } from 'express';
import { getVaccines, addVaccine, updateVaccine, deleteVaccine } from '../controllers/vaccineController';
import { validateVaccine } from '../middleware/validationMiddleware';

const router = Router();

// Route to get all vaccines
router.get('/', getVaccines);

// Route to add a new vaccine
router.post('/', validateVaccine, addVaccine);

// Route to update an existing vaccine
router.put('/:id', validateVaccine, updateVaccine);

// Route to delete a vaccine
router.delete('/:id', deleteVaccine);

export default router;