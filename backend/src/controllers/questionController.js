import { Question } from '../models/Question.js';
import { Quiz } from '../models/Quiz.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getQuizQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    // Role check: If learner or unauthenticated, quiz must be published
    const isPrivileged =
      req.user &&
      (req.user.role === 'admin' ||
        (req.user.role === 'instructor' && quiz.createdBy.toString() === req.user._id.toString()));

    if (!quiz.isPublished && !isPrivileged) {
      return sendError(res, 'Quiz is not published', 403);
    }

    let questionsQuery = Question.find({ quiz: quizId }).sort({ order: 1, createdAt: 1 });

    // CRITICAL SECURITY RULE: Do not expose correct answers or explanations to learners!
    if (!isPrivileged) {
      questionsQuery = questionsQuery.select('quiz questionText questionType options points order');
    }

    let questions = await questionsQuery.lean();

    if (quiz.isRandomized && !isPrivileged) {
      // Fisher-Yates shuffle questions for learner
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    return sendSuccess(res, 'Questions retrieved successfully', {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        timeLimitMinutes: quiz.timeLimitMinutes,
        passPercentage: quiz.passPercentage,
        totalQuestions: questions.length
      },
      questions
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const quizId = req.params.quizId || req.body.quiz;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    // Check authorization: Admin or Quiz Creator
    if (req.user.role === 'instructor' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden. You can only add questions to your own quizzes.', 403);
    }

    const { questionText, questionType, options, correctAnswerId, explanation, points, order } = req.body;

    // Verify correctAnswerId matches an option
    const validOption = options.some((opt) => opt.id === correctAnswerId);
    if (!validOption) {
      return sendError(res, 'Correct answer ID must match one of the options.', 400);
    }

    const currentCount = await Question.countDocuments({ quiz: quizId });

    const question = await Question.create({
      quiz: quizId,
      questionText,
      questionType: questionType || 'single-choice',
      options,
      correctAnswerId,
      explanation,
      points: points || 1,
      order: order !== undefined ? order : currentCount + 1
    });

    return sendSuccess(res, 'Question created successfully', question, 201);
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id).populate('quiz');

    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    // Authorization
    if (req.user.role === 'instructor' && question.quiz.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden. You can only modify questions in your own quizzes.', 403);
    }

    const { questionText, options, correctAnswerId, explanation, points, order } = req.body;

    if (questionText !== undefined) question.questionText = questionText;
    if (options !== undefined) question.options = options;
    if (correctAnswerId !== undefined) {
      const activeOptions = options || question.options;
      const valid = activeOptions.some((o) => o.id === correctAnswerId);
      if (!valid) {
        return sendError(res, 'Correct answer ID must match one of the options.', 400);
      }
      question.correctAnswerId = correctAnswerId;
    }
    if (explanation !== undefined) question.explanation = explanation;
    if (points !== undefined) question.points = points;
    if (order !== undefined) question.order = order;

    await question.save();
    return sendSuccess(res, 'Question updated successfully', question);
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id).populate('quiz');

    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    if (req.user.role === 'instructor' && question.quiz.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden. You can only delete questions from your own quizzes.', 403);
    }

    await Question.findByIdAndDelete(id);
    return sendSuccess(res, 'Question deleted successfully');
  } catch (error) {
    next(error);
  }
};
