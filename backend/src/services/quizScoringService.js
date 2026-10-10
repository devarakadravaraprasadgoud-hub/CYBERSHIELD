import { Question } from '../models/Question.js';
import { Quiz } from '../models/Quiz.js';

export const evaluateQuizSubmission = async (quizId, submittedAnswers = [], startTime = null) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Fetch all questions for this quiz
  const questions = await Question.find({ quiz: quizId }).sort({ order: 1, createdAt: 1 });
  if (!questions || questions.length === 0) {
    throw new Error('This quiz has no questions available');
  }

  const answerMap = new Map();
  for (const item of submittedAnswers) {
    if (item.questionId) {
      answerMap.set(item.questionId.toString(), item.selectedOptionId || null);
    }
  }

  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  const answerSnapshots = [];

  for (const q of questions) {
    const qIdStr = q._id.toString();
    const selectedOptionId = answerMap.get(qIdStr) || null;
    const isCorrect = selectedOptionId !== null && selectedOptionId === q.correctAnswerId;
    const questionPoints = q.points || 1;
    maxScore += questionPoints;

    let pointsAwarded = 0;
    if (isCorrect) {
      pointsAwarded = questionPoints;
      totalScore += questionPoints;
      correctCount += 1;
    }

    answerSnapshots.push({
      questionId: q._id,
      questionText: q.questionText,
      selectedOptionId,
      correctOptionId: q.correctAnswerId,
      isCorrect,
      explanation: q.explanation,
      pointsAwarded,
      maxPoints: questionPoints,
      optionsSnapshot: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text
      }))
    });
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const isPassed = percentage >= (quiz.passPercentage || 70);

  const now = new Date();
  const start = startTime ? new Date(startTime) : new Date(now.getTime() - 60000);
  const durationSeconds = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));

  return {
    quiz,
    answers: answerSnapshots,
    score: totalScore,
    maxScore,
    percentage,
    correctAnswersCount: correctCount,
    totalQuestionsCount: questions.length,
    isPassed,
    submissionTime: now,
    durationSeconds
  };
};
