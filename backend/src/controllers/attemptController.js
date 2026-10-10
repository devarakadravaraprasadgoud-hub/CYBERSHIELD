import { QuizAttempt } from '../models/QuizAttempt.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { evaluateQuizSubmission } from '../services/quizScoringService.js';
import { recordQuizCompletion } from '../services/progressService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

export const startAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (!quiz.isPublished && req.user.role === 'learner') {
      return sendError(res, 'This quiz is currently unavailable', 403);
    }

    const questionCount = await Question.countDocuments({ quiz: quizId });
    if (questionCount === 0) {
      return sendError(res, 'This quiz has no questions available', 400);
    }

    // Create new in-progress attempt
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      status: 'in-progress',
      startTime: new Date(),
      totalQuestionsCount: questionCount
    });

    return sendSuccess(
      res,
      'Quiz attempt started successfully',
      {
        attemptId: attempt._id,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          timeLimitMinutes: quiz.timeLimitMinutes,
          passPercentage: quiz.passPercentage,
          totalQuestions: questionCount
        },
        startTime: attempt.startTime
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const submitAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers = [] } = req.body;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return sendError(res, 'Quiz attempt not found', 404);
    }

    // Enforce ownership: only the user who started the attempt can submit it
    if (attempt.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Unauthorized to submit this quiz attempt', 403);
    }

    // Prevent duplicate submissions
    if (attempt.status === 'completed') {
      return sendError(res, 'This quiz attempt has already been submitted and scored', 400);
    }

    // Evaluate on the server (client answers only supply questionId & selectedOptionId)
    const evaluation = await evaluateQuizSubmission(attempt.quiz, answers, attempt.startTime);

    attempt.status = 'completed';
    attempt.answers = evaluation.answers;
    attempt.score = evaluation.score;
    attempt.maxScore = evaluation.maxScore;
    attempt.percentage = evaluation.percentage;
    attempt.correctAnswersCount = evaluation.correctAnswersCount;
    attempt.totalQuestionsCount = evaluation.totalQuestionsCount;
    attempt.isPassed = evaluation.isPassed;
    attempt.submissionTime = evaluation.submissionTime;
    attempt.durationSeconds = evaluation.durationSeconds;

    await attempt.save();

    // Update learner progress and award achievements
    await recordQuizCompletion(
      req.user._id,
      attempt.quiz,
      evaluation.score,
      evaluation.percentage,
      evaluation.isPassed
    );

    return sendSuccess(res, 'Quiz submitted and evaluated successfully', {
      attempt: {
        _id: attempt._id,
        quiz: attempt.quiz,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        correctAnswersCount: attempt.correctAnswersCount,
        totalQuestionsCount: attempt.totalQuestionsCount,
        durationSeconds: attempt.durationSeconds,
        submissionTime: attempt.submissionTime,
        answers: attempt.answers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttempts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, quizId } = req.query;
    const query = { user: req.user._id, status: 'completed' };

    if (quizId) {
      query.quiz = quizId;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, attempts] = await Promise.all([
      QuizAttempt.countDocuments(query),
      QuizAttempt.find(query)
        .populate({
          path: 'quiz',
          select: 'title difficultyLevel passPercentage topic',
          populate: { path: 'topic', select: 'title category' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    return sendPaginated(res, 'Attempts retrieved successfully', attempts, {
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getAttemptById = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const attempt = await QuizAttempt.findById(attemptId)
      .populate({
        path: 'quiz',
        select: 'title description passPercentage topic createdBy',
        populate: { path: 'topic', select: 'title category' }
      })
      .populate('user', 'name email')
      .lean();

    if (!attempt) {
      return sendError(res, 'Attempt not found', 404);
    }

    const isOwner = attempt.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isQuizInstructor =
      req.user.role === 'instructor' &&
      attempt.quiz.createdBy &&
      attempt.quiz.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isQuizInstructor) {
      return sendError(res, 'Forbidden. You cannot view this attempt.', 403);
    }

    return sendSuccess(res, 'Attempt details retrieved', attempt);
  } catch (error) {
    next(error);
  }
};

export const getQuizAttemptsReport = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 15 } = req.query;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    // Role check: Admin or Quiz Creator
    if (req.user.role === 'instructor' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden. You can only view reports for your own quizzes.', 403);
    }

    const query = { quiz: quizId, status: 'completed' };
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, attempts] = await Promise.all([
      QuizAttempt.countDocuments(query),
      QuizAttempt.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    return sendPaginated(res, 'Quiz attempt report retrieved', attempts, {
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};
