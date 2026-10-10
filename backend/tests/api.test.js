import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Topic } from '../src/models/Topic.js';
import { Quiz } from '../src/models/Quiz.js';
import { Question } from '../src/models/Question.js';
import { QuizAttempt } from '../src/models/QuizAttempt.js';

describe('CyberShield Backend Integration Tests', () => {
  let adminToken = '';
  let instructorToken = '';
  let learnerToken = '';
  let testTopicId = '';
  let testQuizId = '';
  let testQuestionId = '';
  let testAttemptId = '';

  beforeAll(async () => {
    await connectDB();

    // 1. Log in seeded admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cybershield.local', password: 'AdminSecurePass123!' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.accessToken;

    // 2. Log in seeded instructor
    const instRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'instructor@cybershield.local', password: 'InstructorPass123!' });
    expect(instRes.status).toBe(200);
    instructorToken = instRes.body.data.accessToken;

    // 3. Log in seeded learner
    const learnerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'learner@cybershield.local', password: 'LearnerPass123!' });
    expect(learnerRes.status).toBe(200);
    learnerToken = learnerRes.body.data.accessToken;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Authentication & Security Enforcement', () => {
    it('prevents registering as admin from public endpoint', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Hacker',
        email: 'hacker@evil.com',
        password: 'Password123!',
        role: 'admin'
      });
      expect([400, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('successfully registers a new learner with password hashing', async () => {
      const uniqueEmail = `newlearner_${Date.now()}@test.local`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test New Learner',
        email: uniqueEmail,
        password: 'SecurePass123!',
        role: 'learner'
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe(uniqueEmail);

      // Verify password hash in db is not plaintext
      const dbUser = await User.findOne({ email: uniqueEmail });
      expect(dbUser.passwordHash).not.toBe('SecurePass123!');
      expect(dbUser.passwordHash.startsWith('$2')).toBe(true);
    });

    it('rejects login with incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'learner@cybershield.local',
        password: 'WrongPassword999!'
      });
      expect(res.status).toBe(401);
    });

    it('blocks unauthenticated access to protected profile', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('allows authenticated access to profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${learnerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('learner@cybershield.local');
    });
  });

  describe('2. Role-Based Access Control (RBAC)', () => {
    it('forbids learners from creating topics', async () => {
      const res = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          title: 'Unauthorized Topic',
          description: 'A test unauthorized description that exceeds 10 chars',
          category: 'Identity'
        });
      expect(res.status).toBe(403);
    });

    it('allows admin to create a new cybersecurity topic', async () => {
      const res = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Cloud Infrastructure Defense ${Date.now()}`,
          description: 'A comprehensive guide to IAM policies, bucket security, and VPC service controls.',
          category: 'Cloud Security',
          difficultyLevel: 'intermediate',
          isPublished: true
        });
      expect(res.status).toBe(201);
      testTopicId = res.body.data._id;
    });

    it('forbids learners from accessing user management', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${learnerToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to retrieve registered users list with pagination', async () => {
      const res = await request(app)
        .get('/api/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination.page).toBe(1);
    });
  });

  describe('3. Quiz Engine & Server-Side Scoring Security', () => {
    it('allows instructor to create a quiz under a topic', async () => {
      const res = await request(app)
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: `Automated Quiz ${Date.now()}`,
          description: 'Automated test quiz evaluating server-side scoring.',
          topic: testTopicId,
          difficultyLevel: 'beginner',
          timeLimitMinutes: 5,
          passPercentage: 70,
          isPublished: true
        });
      expect(res.status).toBe(201);
      testQuizId = res.body.data._id;
    });

    it('allows adding questions with valid options and correct answer id', async () => {
      const res = await request(app)
        .post(`/api/quizzes/${testQuizId}/questions`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          questionText: 'What is the primary purpose of an air-gapped backup copy?',
          questionType: 'single-choice',
          options: [
            { id: 'opt_a', text: 'To accelerate network transfer speeds across local subnets' },
            { id: 'opt_b', text: 'To physically isolate data from network-accessible attacks like ransomware' },
            { id: 'opt_c', text: 'To reduce electricity consumption of backup storage drives' }
          ],
          correctAnswerId: 'opt_b',
          explanation: 'Air-gapping physically disconnects the backup media from all digital networks, preventing remote malware compromise.',
          points: 1
        });
      expect(res.status).toBe(201);
      testQuestionId = res.body.data._id;
    });

    it('NEVER exposes correctAnswerId or explanation to learners in quiz question list', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${testQuizId}/questions`)
        .set('Authorization', `Bearer ${learnerToken}`);
      expect(res.status).toBe(200);
      const question = res.body.data.questions[0];
      expect(question._id).toBe(testQuestionId);
      expect(question.correctAnswerId).toBeUndefined();
      expect(question.explanation).toBeUndefined();
    });

    it('allows learner to start a quiz attempt', async () => {
      const res = await request(app)
        .post(`/api/quizzes/${testQuizId}/attempts`)
        .set('Authorization', `Bearer ${learnerToken}`);
      expect(res.status).toBe(201);
      expect(res.body.data.attemptId).toBeDefined();
      testAttemptId = res.body.data.attemptId;
    });

    it('evaluates answers strictly server-side upon submission and returns score feedback', async () => {
      const res = await request(app)
        .post(`/api/attempts/${testAttemptId}/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          answers: [
            {
              questionId: testQuestionId,
              selectedOptionId: 'opt_b' // The correct answer!
            }
          ]
        });
      expect(res.status).toBe(200);
      const { attempt } = res.body.data;
      expect(attempt.score).toBe(1);
      expect(attempt.percentage).toBe(100);
      expect(attempt.isPassed).toBe(true);
      expect(attempt.answers[0].isCorrect).toBe(true);
      expect(attempt.answers[0].explanation).toBeDefined();
    });

    it('prevents duplicate submissions on an already completed attempt', async () => {
      const res = await request(app)
        .post(`/api/attempts/${testAttemptId}/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          answers: [{ questionId: testQuestionId, selectedOptionId: 'opt_a' }]
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already been submitted');
    });

    it('prevents other users from submitting an attempt they do not own', async () => {
      // Start an attempt with instructor
      const startRes = await request(app)
        .post(`/api/quizzes/${testQuizId}/attempts`)
        .set('Authorization', `Bearer ${instructorToken}`);
      const instructorAttemptId = startRes.body.data.attemptId;

      // Learner attempts to submit instructor's attempt
      const hijackRes = await request(app)
        .post(`/api/attempts/${instructorAttemptId}/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({ answers: [] });
      expect(hijackRes.status).toBe(403);
    });
  });

  describe('4. Learner Progress & Dashboard Metrics', () => {
    it('returns learner dashboard with real metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard/learner')
        .set('Authorization', `Bearer ${learnerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.metrics.totalAttempts).toBeGreaterThanOrEqual(1);
      expect(res.body.data.metrics.averageScore).toBeGreaterThanOrEqual(0);
    });

    it('returns admin dashboard with real aggregated platform metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.metrics.totalUsers).toBeGreaterThanOrEqual(3);
      expect(res.body.data.metrics.totalTopics).toBeGreaterThanOrEqual(8);
      expect(res.body.data.metrics.totalQuizzes).toBeGreaterThanOrEqual(5);
    });
  });
});
