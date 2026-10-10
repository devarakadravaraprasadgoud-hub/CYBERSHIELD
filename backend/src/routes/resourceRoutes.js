import { Router } from 'express';
import {
  getModuleResources,
  getResourceById,
  saveResourceProgress,
  getMyResourceProgress,
  getAllResourcesAdmin,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resourceController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import {
  createResourceSchema,
  updateResourceSchema,
  saveProgressSchema
} from '../validators/resourceValidators.js';

const router = Router();

// Student Progress Routes
router.get('/progress/my', authenticate, getMyResourceProgress);
router.post(
  '/:id/progress',
  authenticate,
  validateBody(saveProgressSchema),
  saveResourceProgress
);

// Admin / Instructor Management Routes
router.get('/admin/all', authenticate, authorize('admin', 'instructor'), getAllResourcesAdmin);
router.post(
  '/',
  authenticate,
  authorize('admin', 'instructor'),
  validateBody(createResourceSchema),
  createResource
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'instructor'),
  validateBody(updateResourceSchema),
  updateResource
);
router.delete('/:id', authenticate, authorize('admin', 'instructor'), deleteResource);

// Resource Query Routes
router.get('/module/:moduleId', optionalAuth, getModuleResources);
router.get('/:id', optionalAuth, getResourceById);

export default router;
