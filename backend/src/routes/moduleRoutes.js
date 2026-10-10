import { Router } from 'express';
import {
  getAllModules,
  getModuleById,
  completeModule,
  createModule,
  updateModule,
  deleteModule
} from '../controllers/moduleController.js';
import { getModuleResources } from '../controllers/resourceController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import { createModuleSchema, updateModuleSchema } from '../validators/moduleValidators.js';

const router = Router();

router.get('/', optionalAuth, getAllModules);
router.get('/:id', optionalAuth, getModuleById);
router.get('/:moduleId/resources', optionalAuth, getModuleResources);
router.post('/:id/complete', authenticate, completeModule);
router.post(
  '/',
  authenticate,
  authorize('admin', 'instructor'),
  validateBody(createModuleSchema),
  createModule
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'instructor'),
  validateBody(updateModuleSchema),
  updateModule
);
router.delete('/:id', authenticate, authorize('admin', 'instructor'), deleteModule);

export default router;
