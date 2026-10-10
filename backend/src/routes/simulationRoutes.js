import express from 'express';
import {
  getSimulations,
  getSimulationById,
  startOrGetSession,
  updateSessionProgress,
  completeSession,
  getMySimulationProgress,
  getAllSimulationsAdmin,
  createSimulation,
  updateSimulation,
  deleteSimulation
} from '../controllers/simulationController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import {
  createSimulationSchema,
  updateSimulationSchema,
  updateSessionProgressSchema,
  completeSessionSchema
} from '../validators/simulationValidators.js';

const router = express.Router();

// Public / Learner endpoints
router.get('/', optionalAuth, getSimulations);
router.get('/progress/my', authenticate, getMySimulationProgress);
router.get('/:id', optionalAuth, getSimulationById);
router.post('/:id/session', authenticate, startOrGetSession);
router.patch(
  '/sessions/:sessionId/progress',
  authenticate,
  validateBody(updateSessionProgressSchema),
  updateSessionProgress
);
router.post(
  '/sessions/:sessionId/complete',
  authenticate,
  validateBody(completeSessionSchema),
  completeSession
);

// Admin / Instructor endpoints
router.get('/admin/all', authenticate, authorize('admin', 'instructor'), getAllSimulationsAdmin);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateBody(createSimulationSchema),
  createSimulation
);
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateBody(updateSimulationSchema),
  updateSimulation
);
router.delete('/:id', authenticate, authorize('admin'), deleteSimulation);

export default router;
