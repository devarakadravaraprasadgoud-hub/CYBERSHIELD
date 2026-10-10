import { Router } from 'express';
import { updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import { updateQuestionSchema } from '../validators/questionValidators.js';

const router = Router();

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'instructor'),
  validateBody(updateQuestionSchema),
  updateQuestion
);
router.delete('/:id', authenticate, authorize('admin', 'instructor'), deleteQuestion);

export default router;
