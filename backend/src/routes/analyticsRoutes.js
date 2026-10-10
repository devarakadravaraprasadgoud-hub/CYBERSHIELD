import { Router } from 'express';
import { getQuizPerformanceAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(authenticate);

router.get('/quiz-performance', authorize('admin', 'instructor'), getQuizPerformanceAnalytics);

export default router;
