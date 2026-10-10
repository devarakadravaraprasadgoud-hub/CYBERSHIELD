import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { LearningModule } from '../models/LearningModule.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Progress } from '../models/Progress.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getLearnerDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch learner progress
    let progress = await Progress.findOne({ user: userId })
      .populate('completedModules.module', 'title slug topic difficultyLevel estimatedReadingTime')
      .populate('quizStats.quiz', 'title difficultyLevel passPercentage')
      .lean();

    const attempts = await QuizAttempt.find({ user: userId, status: 'completed' })
      .populate({
        path: 'quiz',
        select: 'title difficultyLevel passPercentage topic',
        populate: { path: 'topic', select: 'title category' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const totalAttempts = attempts.length;
    const avgScore =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts)
        : 0;

    const completedModuleIds = progress?.completedModules?.map((m) => m.module?._id?.toString() || m.module?.toString()) || [];
    const completedCount = completedModuleIds.length;

    // Recommend published modules not yet completed
    const recommendedModules = await LearningModule.find({
      isPublished: true,
      _id: { $nin: completedModuleIds }
    })
      .populate('topic', 'title category iconName')
      .limit(4)
      .lean();

    // Determine continue-learning action
    let continueAction = null;
    if (recommendedModules.length > 0) {
      continueAction = {
        type: 'module',
        id: recommendedModules[0]._id,
        title: recommendedModules[0].title,
        slug: recommendedModules[0].slug
      };
    } else if (attempts.length > 0) {
      continueAction = {
        type: 'quiz',
        id: attempts[0].quiz?._id,
        title: attempts[0].quiz?.title
      };
    }

    return sendSuccess(res, 'Learner dashboard data retrieved', {
      user: req.user.toSafeObject(),
      metrics: {
        totalAttempts,
        averageScore: avgScore,
        completedModules: completedCount,
        achievementsCount: progress?.achievements?.length || 0,
        passedQuizzesCount: progress?.quizStats?.filter((q) => q.isPassed).length || 0
      },
      recentAttempts: attempts.slice(0, 5),
      recommendedModules,
      continueAction,
      achievements: progress?.achievements || []
    });
  } catch (error) {
    next(error);
  }
};

export const getInstructorDashboard = async (req, res, next) => {
  try {
    const instructorId = req.user._id;

    // Modules and Quizzes created by this instructor
    const [myModules, myQuizzes] = await Promise.all([
      LearningModule.find({ createdBy: instructorId }).lean(),
      Quiz.find({ createdBy: instructorId }).lean()
    ]);

    const quizIds = myQuizzes.map((q) => q._id);

    // Questions across instructor's quizzes
    const totalQuestions = await Question.countDocuments({ quiz: { $in: quizIds } });

    // Attempts on instructor's quizzes
    const attempts = await QuizAttempt.find({ quiz: { $in: quizIds }, status: 'completed' })
      .populate('quiz', 'title difficultyLevel')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const totalLearnerAttempts = attempts.length;
    const avgScore =
      totalLearnerAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalLearnerAttempts)
        : 0;

    const passCount = attempts.filter((a) => a.isPassed).length;
    const passRate = totalLearnerAttempts > 0 ? Math.round((passCount / totalLearnerAttempts) * 100) : 0;

    return sendSuccess(res, 'Instructor dashboard retrieved', {
      metrics: {
        totalModules: myModules.length,
        totalQuizzes: myQuizzes.length,
        totalQuestions,
        totalLearnerAttempts,
        averageScore: avgScore,
        passRate
      },
      myQuizzes: myQuizzes.slice(0, 5),
      recentAttempts: attempts.slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTopics,
      publishedTopics,
      totalModules,
      publishedModules,
      totalQuizzes,
      publishedQuizzes,
      totalAttempts,
      recentUsers,
      recentAttempts
    ] = await Promise.all([
      User.countDocuments(),
      Topic.countDocuments(),
      Topic.countDocuments({ isPublished: true }),
      LearningModule.countDocuments(),
      LearningModule.countDocuments({ isPublished: true }),
      Quiz.countDocuments(),
      Quiz.countDocuments({ isPublished: true }),
      QuizAttempt.countDocuments({ status: 'completed' }),
      User.find().select('name email role status createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      QuizAttempt.find({ status: 'completed' })
        .populate('quiz', 'title')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean()
    ]);

    // Average score and pass rate
    const scoreAgg = await QuizAttempt.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$percentage' },
          passCount: {
            $sum: { $cond: [{ $eq: ['$isPassed', true] }, 1, 0] }
          }
        }
      }
    ]);

    const avgScore = scoreAgg[0]?.avgScore ? Math.round(scoreAgg[0].avgScore) : 0;
    const passRate =
      totalAttempts > 0 && scoreAgg[0]?.passCount
        ? Math.round((scoreAgg[0].passCount / totalAttempts) * 100)
        : 0;

    // User breakdown
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersByRole = { learner: 0, instructor: 0, admin: 0 };
    roleCounts.forEach((r) => {
      if (usersByRole[r._id] !== undefined) usersByRole[r._id] = r.count;
    });

    return sendSuccess(res, 'Admin dashboard metrics retrieved', {
      metrics: {
        totalUsers,
        usersByRole,
        totalTopics,
        publishedTopics,
        totalModules,
        publishedModules,
        totalQuizzes,
        publishedQuizzes,
        totalAttempts,
        averageScore: avgScore,
        passRate
      },
      recentUsers,
      recentAttempts
    });
  } catch (error) {
    next(error);
  }
};
