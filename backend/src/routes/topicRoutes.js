import { Router } from 'express';
import {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic
} from '../controllers/topicController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import { createTopicSchema, updateTopicSchema } from '../validators/topicValidators.js';

const router = Router();

router.get('/', optionalAuth, getAllTopics);
router.get('/:id', optionalAuth, getTopicById);
router.post('/', authenticate, authorize('admin'), validateBody(createTopicSchema), createTopic);
router.put('/:id', authenticate, authorize('admin'), validateBody(updateTopicSchema), updateTopic);
router.delete('/:id', authenticate, authorize('admin'), deleteTopic);

export default router;
