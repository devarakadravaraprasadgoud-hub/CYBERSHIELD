import { Router } from 'express';
import {
  getLearnerDashboard,
  getInstructorDashboard,
  getAdminDashboard
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = Router();

router.use(authenticate);

router.get('/learner', authorize('learner', 'admin', 'instructor'), getLearnerDashboard);
router.get('/instructor', authorize('instructor', 'admin'), getInstructorDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);

export default router;
