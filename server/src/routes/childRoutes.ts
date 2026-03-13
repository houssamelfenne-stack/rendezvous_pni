import { Router } from 'express';
import { addChild, getChildren, updateChild, deleteChild } from '../controllers/childController';
import { validateChild } from '../middleware/validationMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Route to add a new child
router.post('/', authenticate, validateChild, addChild);

// Route to get all children for the authenticated user
router.get('/', authenticate, getChildren);

// Route to update a child's information
router.put('/:id', authenticate, validateChild, updateChild);

// Route to delete a child
router.delete('/:id', authenticate, deleteChild);

export default router;