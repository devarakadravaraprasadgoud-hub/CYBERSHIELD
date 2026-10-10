import { Progress } from '../models/Progress.js';
import { LearningModule } from '../models/LearningModule.js';
import { Quiz } from '../models/Quiz.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getOrCreateProgress } from '../services/progressService.js';

export const getMyProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let progress = await Progress.findOne({ user: userId })
      .populate({
        path: 'completedModules.module',
        select: 'title slug topic difficultyLevel estimatedReadingTime',
        populate: { path: 'topic', select: 'title category' }
      })
      .populate({
        path: 'viewedModules.module',
        select: 'title slug topic difficultyLevel estimatedReadingTime',
        populate: { path: 'topic', select: 'title category' }
      })
      .populate({
        path: 'quizStats.quiz',
        select: 'title difficultyLevel passPercentage topic',
        populate: { path: 'topic', select: 'title category' }
      })
      .lean();

    if (!progress) {
      await getOrCreateProgress(userId);
      progress = await Progress.findOne({ user: userId }).lean();
    }

    // Platform-wide counts to compute percentage
    const [totalPublishedModules, totalPublishedQuizzes] = await Promise.all([
      LearningModule.countDocuments({ isPublished: true }),
      Quiz.countDocuments({ isPublished: true })
    ]);

    const completedModulesCount = progress.completedModules ? progress.completedModules.length : 0;
    const passedQuizzesCount = progress.quizStats ? progress.quizStats.filter((q) => q.isPassed).length : 0;

    const moduleCompletionPercentage =
      totalPublishedModules > 0 ? Math.round((completedModulesCount / totalPublishedModules) * 100) : 0;
    const quizPassPercentage =
      totalPublishedQuizzes > 0 ? Math.round((passedQuizzesCount / totalPublishedQuizzes) * 100) : 0;

    return sendSuccess(res, 'Progress retrieved successfully', {
      progress,
      metrics: {
        totalPublishedModules,
        totalPublishedQuizzes,
        completedModulesCount,
        passedQuizzesCount,
        moduleCompletionPercentage,
        quizPassPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};
