import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Topic } from '../models/Topic.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import { Progress } from '../models/Progress.js';

export const getAllQuizzes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      topic,
      difficultyLevel,
      search = '',
      isPublished,
      instructor
    } = req.query;

    const query = {};

    if (!req.user || req.user.role === 'learner') {
      query.isPublished = true;
    } else if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }

    if (topic) {
      query.topic = topic;
    }

    if (difficultyLevel) {
      query.difficultyLevel = difficultyLevel;
    }

    if (instructor) {
      query.createdBy = instructor;
    } else if (req.user && req.user.role === 'instructor' && req.query.myOnly === 'true') {
      query.createdBy = req.user._id;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, quizzes] = await Promise.all([
      Quiz.countDocuments(query),
      Quiz.find(query)
        .populate('topic', 'title slug category iconName')
        .populate('learningModule', 'title slug')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    // Attach questions count and user quiz stats if learner
    let userStatsMap = new Map();
    if (req.user && req.user.role === 'learner') {
      const progress = await Progress.findOne({ user: req.user._id });
      if (progress && progress.quizStats) {
        progress.quizStats.forEach((stat) => {
          userStatsMap.set(stat.quiz.toString(), stat);
        });
      }
    }

    const enrichedQuizzes = await Promise.all(
      quizzes.map(async (q) => {
        const questionCount = await Question.countDocuments({ quiz: q._id });
        const userStat = userStatsMap.get(q._id.toString());
        return {
          ...q,
          questionCount,
          bestScore: userStat ? userStat.bestScore : null,
          bestPercentage: userStat ? userStat.bestPercentage : null,
          isPassed: userStat ? userStat.isPassed : false,
          attemptsCount: userStat ? userStat.attemptsCount : 0
        };
      })
    );

    return sendPaginated(res, 'Quizzes retrieved successfully', enrichedQuizzes, {
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id)
      .populate('topic', 'title slug category iconName')
      .populate('learningModule', 'title slug shortDescription')
      .populate('createdBy', 'name email role')
      .lean();

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (!quiz.isPublished && (!req.user || req.user.role === 'learner')) {
      return sendError(res, 'This quiz is not currently published', 403);
    }

    const questionCount = await Question.countDocuments({ quiz: quiz._id });

    let userStat = null;
    let recentAttempts = [];
    if (req.user && req.user.role === 'learner') {
      const progress = await Progress.findOne({ user: req.user._id });
      if (progress && progress.quizStats) {
        userStat = progress.quizStats.find((s) => s.quiz.toString() === quiz._id.toString());
      }
      recentAttempts = await QuizAttempt.find({ user: req.user._id, quiz: quiz._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('score maxScore percentage isPassed durationSeconds createdAt')
        .lean();
    }

    return sendSuccess(res, 'Quiz retrieved successfully', {
      ...quiz,
      questionCount,
      userStat: userStat || null,
      recentAttempts
    });
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      description,
      topic,
      learningModule,
      difficultyLevel,
      timeLimitMinutes,
      passPercentage,
      isRandomized,
      isPublished
    } = req.body;

    const topicExists = await Topic.findById(topic);
    if (!topicExists) {
      return sendError(res, 'Topic not found', 404);
    }

    const newQuiz = await Quiz.create({
      title,
      description,
      topic,
      learningModule: learningModule || null,
      difficultyLevel,
      timeLimitMinutes: timeLimitMinutes || 10,
      passPercentage: passPercentage || 70,
      isRandomized: isRandomized || false,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user._id
    });

    return sendSuccess(res, 'Quiz created successfully', newQuiz, 201);
  } catch (error) {
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (req.user.role === 'instructor' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden. You can only update quizzes you created.', 403);
    }

    const {
      title,
      description,
      topic,
      learningModule,
      difficultyLevel,
      timeLimitMinutes,
      passPercentage,
      isRandomized,
      isPublished
    } = req.body;

    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (topic !== undefined) quiz.topic = topic;
    if (learningModule !== undefined) quiz.learningModule = learningModule;
    if (difficultyLevel !== undefined) quiz.difficultyLevel = difficultyLevel;
    if (timeLimitMinutes !== undefined) quiz.timeLimitMinutes = timeLimitMinutes;
    if (passPercentage !== undefined) quiz.passPercentage = passPercentage;
    if (isRandomized !== undefined) quiz.isRandomized = isRandomized;
    if (isPublished !== undefined) quiz.isPublished = isPublished;

    await quiz.save();
    return sendSuccess(res, 'Quiz updated successfully', quiz);
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (req.user.role === 'instructor' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden. You can only delete quizzes you created.', 403);
    }

    await Promise.all([
      Question.deleteMany({ quiz: id }),
      QuizAttempt.deleteMany({ quiz: id }),
      Quiz.findByIdAndDelete(id)
    ]);

    return sendSuccess(res, 'Quiz and its questions deleted successfully');
  } catch (error) {
    next(error);
  }
};
