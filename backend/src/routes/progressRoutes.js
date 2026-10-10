import { Router } from 'express';
import { getMyProgress } from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/my', getMyProgress);

export default router;
