import { Router } from 'express';
import { addChild, getChildren, updateChild, deleteChild } from '../controllers/childController';
import { validateChild } from '../middleware/validationMiddleware';
import { authenticate, requireRoles } from '../middleware/authMiddleware';

const router = Router();

// Route to add a new child
router.post('/', authenticate, requireRoles('citizen'), validateChild, addChild);

// Route to get all children for the authenticated user
router.get('/', authenticate, requireRoles('citizen'), getChildren);

// Route to update a child's information
router.put('/:id', authenticate, requireRoles('citizen'), validateChild, updateChild);

// Route to delete a child
router.delete('/:id', authenticate, requireRoles('citizen'), deleteChild);

export default router;