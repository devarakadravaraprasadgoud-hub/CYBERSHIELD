import { QuizAttempt } from '../models/QuizAttempt.js';
import { Quiz } from '../models/Quiz.js';
import { Topic } from '../models/Topic.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getQuizPerformanceAnalytics = async (req, res, next) => {
  try {
    const isInstructor = req.user.role === 'instructor';
    let quizMatch = {};

    if (isInstructor) {
      const myQuizzes = await Quiz.find({ createdBy: req.user._id }).select('_id');
      const myQuizIds = myQuizzes.map((q) => q._id);
      quizMatch = { quiz: { $in: myQuizIds } };
    }

    // 1. Score distributions
    const attempts = await QuizAttempt.find({ status: 'completed', ...quizMatch }).lean();

    const distribution = [
      { range: '0-49%', count: 0, label: 'Needs Improvement' },
      { range: '50-69%', count: 0, label: 'Developing' },
      { range: '70-84%', count: 0, label: 'Proficient' },
      { range: '85-100%', count: 0, label: 'Mastery' }
    ];

    attempts.forEach((a) => {
      const p = a.percentage || 0;
      if (p < 50) distribution[0].count++;
      else if (p < 70) distribution[1].count++;
      else if (p < 85) distribution[2].count++;
      else distribution[3].count++;
    });

    // 2. Performance by Quiz
    const quizStats = await QuizAttempt.aggregate([
      { $match: { status: 'completed', ...quizMatch } },
      {
        $group: {
          _id: '$quiz',
          avgPercentage: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 },
          passCount: {
            $sum: { $cond: [{ $eq: ['$isPassed', true] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quizDetails'
        }
      },
      { $unwind: '$quizDetails' },
      {
        $project: {
          quizId: '$_id',
          title: '$quizDetails.title',
          avgPercentage: { $round: ['$avgPercentage', 1] },
          totalAttempts: 1,
          passRate: {
            $round: [{ $multiply: [{ $divide: ['$passCount', '$totalAttempts'] }, 100] }, 1]
          }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 10 }
    ]);

    // 3. Activity trends (grouped by date)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

    const timeline = await QuizAttempt.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo },
          ...quizMatch
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          attempts: { $sum: 1 },
          avgScore: { $avg: '$percentage' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          attempts: 1,
          avgScore: { $round: ['$avgScore', 1] },
          _id: 0
        }
      }
    ]);

    return sendSuccess(res, 'Quiz performance analytics retrieved', {
      distribution,
      quizStats,
      timeline,
      totalAnalyzedAttempts: attempts.length
    });
  } catch (error) {
    next(error);
  }
};
