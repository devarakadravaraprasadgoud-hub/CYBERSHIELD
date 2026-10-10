import { Router } from 'express';
import { getAllUsers, getUserById, updateUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', authorize('admin'), updateUser);

export default router;
