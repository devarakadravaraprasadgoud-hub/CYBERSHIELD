import { Router } from 'express';
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from '../controllers/quizController.js';
import { getQuizQuestions, createQuestion } from '../controllers/questionController.js';
import { startAttempt, getQuizAttemptsReport } from '../controllers/attemptController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import { createQuizSchema, updateQuizSchema } from '../validators/quizValidators.js';
import { createQuestionSchema } from '../validators/questionValidators.js';

const router = Router();

router.get('/', optionalAuth, getAllQuizzes);
router.get('/:id', optionalAuth, getQuizById);
router.post(
  '/',
  authenticate,
  authorize('admin', 'instructor'),
  validateBody(createQuizSchema),
  createQuiz
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'instructor'),
  validateBody(updateQuizSchema),
  updateQuiz
);
router.delete('/:id', authenticate, authorize('admin', 'instructor'), deleteQuiz);

// Nested question & attempt routes
router.get('/:quizId/questions', optionalAuth, getQuizQuestions);
router.post(
  '/:quizId/questions',
  authenticate,
  authorize('admin', 'instructor'),
  validateBody(createQuestionSchema),
  createQuestion
);
router.post('/:quizId/attempts', authenticate, startAttempt);
router.get('/:quizId/attempts', authenticate, authorize('admin', 'instructor'), getQuizAttemptsReport);

export default router;
