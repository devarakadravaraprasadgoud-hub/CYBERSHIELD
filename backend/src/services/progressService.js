import { Progress } from '../models/Progress.js';
import { Achievement } from '../models/Achievement.js';

export const getOrCreateProgress = async (userId) => {
  let progress = await Progress.findOne({ user: userId });
  if (!progress) {
    try {
      progress = await Progress.create({
        user: userId,
        completedModules: [],
        viewedModules: [],
        quizStats: [],
        achievements: []
      });
    } catch (err) {
      if (err.code === 11000) {
        progress = await Progress.findOne({ user: userId });
      } else {
        throw err;
      }
    }
  }
  return progress;
};

export const checkAndAwardAchievement = async (progress, code, title, description, badgeIcon) => {
  const hasIt = progress.achievements.some((a) => a.code === code);
  if (!hasIt) {
    progress.achievements.push({
      code,
      title,
      description,
      badgeIcon,
      earnedAt: new Date()
    });
    return true;
  }
  return false;
};

export const recordModuleViewed = async (userId, moduleId) => {
  const progress = await getOrCreateProgress(userId);
  const existing = progress.viewedModules.find((v) => v.module.toString() === moduleId.toString());
  if (existing) {
    existing.lastViewedAt = new Date();
  } else {
    progress.viewedModules.push({
      module: moduleId,
      lastViewedAt: new Date()
    });
  }
  await progress.save();
  return progress;
};

export const recordModuleCompleted = async (userId, moduleId) => {
  const progress = await getOrCreateProgress(userId);
  const alreadyCompleted = progress.completedModules.some((m) => m.module.toString() === moduleId.toString());

  if (!alreadyCompleted) {
    progress.completedModules.push({
      module: moduleId,
      completedAt: new Date()
    });

    // Award Achievements
    if (progress.completedModules.length >= 1) {
      await checkAndAwardAchievement(
        progress,
        'first-module',
        'Knowledge Seeker',
        'Completed your first cybersecurity learning module',
        'BookOpen'
      );
    }
    if (progress.completedModules.length >= 5) {
      await checkAndAwardAchievement(
        progress,
        'module-master',
        'Cyber Guardian',
        'Completed 5 cybersecurity learning modules',
        'Shield'
      );
    }
    if (progress.completedModules.length >= 10) {
      await checkAndAwardAchievement(
        progress,
        'security-architect',
        'Security Architect',
        'Completed 10 cybersecurity learning modules',
        'Award'
      );
    }

    await progress.save();
  }

  return progress;
};

export const recordQuizCompletion = async (userId, quizId, score, percentage, isPassed) => {
  const progress = await getOrCreateProgress(userId);
  const existingStat = progress.quizStats.find((s) => s.quiz.toString() === quizId.toString());

  if (existingStat) {
    existingStat.attemptsCount += 1;
    existingStat.lastAttemptAt = new Date();
    if (score > existingStat.bestScore) {
      existingStat.bestScore = score;
      existingStat.bestPercentage = percentage;
    }
    if (isPassed) {
      existingStat.isPassed = true;
    }
  } else {
    progress.quizStats.push({
      quiz: quizId,
      bestScore: score,
      bestPercentage: percentage,
      isPassed,
      attemptsCount: 1,
      lastAttemptAt: new Date()
    });
  }

  // Quiz Achievements
  await checkAndAwardAchievement(
    progress,
    'first-quiz',
    'Threat Analyst',
    'Completed your first cybersecurity quiz assessment',
    'FileCheck'
  );

  if (percentage === 100) {
    await checkAndAwardAchievement(
      progress,
      'perfect-score',
      'Flawless Defense',
      'Achieved a perfect 100% score on a cybersecurity quiz',
      'Zap'
    );
  }

  const passedCount = progress.quizStats.filter((q) => q.isPassed).length;
  if (passedCount >= 3) {
    await checkAndAwardAchievement(
      progress,
      'shield-bearer',
      'Shield Bearer',
      'Passed at least 3 distinct cybersecurity quizzes',
      'ShieldCheck'
    );
  }

  const totalAttempts = progress.quizStats.reduce((acc, curr) => acc + curr.attemptsCount, 0);
  if (totalAttempts >= 5) {
    await checkAndAwardAchievement(
      progress,
      'quiz-veteran',
      'Incident Commander',
      'Conducted 5 or more cybersecurity quiz assessments',
      'Terminal'
    );
  }

  await progress.save();
  return progress;
};
