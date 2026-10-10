import { Router } from 'express';
import {
  submitAttempt,
  getMyAttempts,
  getAttemptById
} from '../controllers/attemptController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/:attemptId/submit', submitAttempt);
router.get('/my', getMyAttempts);
router.get('/:attemptId', getAttemptById);

export default router;
