import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { AttackSimulation } from '../src/models/AttackSimulation.js';
import { SimulationSession } from '../src/models/SimulationSession.js';

describe('CyberShield Watch How It Happens — Attack Simulation Engine Tests', () => {
  let adminToken = '';
  let learnerToken = '';
  let testSimulationId = '';
  let testSessionId = '';
  let newlyCreatedSimulationId = '';

  beforeAll(async () => {
    await connectDB();

    // 1. Log in seeded admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cybershield.local', password: 'AdminSecurePass123!' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.accessToken;

    // 2. Log in seeded learner
    const learnerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'learner@cybershield.local', password: 'LearnerPass123!' });
    expect(learnerRes.status).toBe(200);
    learnerToken = learnerRes.body.data.accessToken;

    // Grab a seeded attack simulation
    const firstSim = await AttackSimulation.findOne({ isPublished: true });
    expect(firstSim).toBeDefined();
    testSimulationId = firstSim._id.toString();
  });

  afterAll(async () => {
    // Cleanup any test created simulations and sessions
    if (newlyCreatedSimulationId) {
      await AttackSimulation.findByIdAndDelete(newlyCreatedSimulationId);
      await SimulationSession.deleteMany({ simulation: newlyCreatedSimulationId });
    }
    await disconnectDB();
  });

  it('GET /api/simulations - lists published attack simulations with telemetry', async () => {
    const res = await request(app).get('/api/simulations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const first = res.body.data[0];
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('slug');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('difficulty');
  });

  it('GET /api/simulations?category=phishing - filters by category', async () => {
    const res = await request(app).get('/api/simulations?category=phishing');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((s) => s.category === 'phishing')).toBe(true);
  });

  it('GET /api/simulations/:id - retrieves full simulation with nodes and stages', async () => {
    const res = await request(app).get(`/api/simulations/${testSimulationId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(testSimulationId);
    expect(Array.isArray(res.body.data.nodes)).toBe(true);
    expect(Array.isArray(res.body.data.attackStages)).toBe(true);
    expect(Array.isArray(res.body.data.defenseStages)).toBe(true);
  });

  it('POST /api/simulations/:id/session - initializes learner simulation session', async () => {
    const res = await request(app)
      .post(`/api/simulations/${testSimulationId}/session`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({ mode: 'attack' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.simulation).toBe(testSimulationId);
    expect(res.body.data.mode).toBe('attack');
    testSessionId = res.body.data._id;
  });

  it('PATCH /api/simulations/sessions/:sessionId/progress - saves stage and decision', async () => {
    const res = await request(app)
      .patch(`/api/simulations/sessions/${testSessionId}/progress`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        mode: 'attack',
        currentStageIndex: 2,
        completedStageId: 'stage-1',
        decision: {
          question: 'What should you do with a suspicious link?',
          selectedOptionId: 'opt-report',
          isCorrect: true,
          explanation: 'Reporting alerts the SOC team.'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentStageIndex).toBe(2);
    expect(res.body.data.completedStageIds).toContain('stage-1');
    expect(res.body.data.decisions.length).toBeGreaterThan(0);
  });

  it('POST /api/simulations/sessions/:sessionId/complete - completes session and computes score', async () => {
    const res = await request(app)
      .post(`/api/simulations/sessions/${testSessionId}/complete`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({ score: 100 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCompleted).toBe(true);
    expect(res.body.data.score).toBe(100);
  });

  it('GET /api/simulations/progress/my - retrieves learner simulation history', async () => {
    const res = await request(app)
      .get('/api/simulations/progress/my')
      .set('Authorization', `Bearer ${learnerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('completedCount');
    expect(res.body.data).toHaveProperty('masteryPercentage');
  });

  it('POST /api/simulations - allows admin to author new attack simulation', async () => {
    const payload = {
      title: 'Automated Test Cross-Site Scripting (XSS) Scenario',
      description: 'Comprehensive demonstration of Stored XSS vs Content Security Policy.',
      category: 'xss',
      difficulty: 'intermediate',
      estimatedDuration: '7 min',
      learningObjectives: ['Understand XSS injection contexts', 'Configure Content Security Policy (CSP) headers'],
      nodes: [
        { id: 'x1', label: 'Start', type: 'start', x: 50, y: 50, category: 'Input' },
        { id: 'x2', label: 'Stored Script', type: 'weakness', x: 200, y: 50, category: 'Storage' }
      ],
      edges: [
        { id: 'xe1', from: 'x1', to: 'x2', label: 'Inject', animated: true }
      ],
      attackStages: [
        {
          stageId: 'xs-1',
          stageNumber: 1,
          title: 'Script Injection into Message Board',
          nodeId: 'x1',
          nodeType: 'start',
          description: 'Attacker inputs unescaped script tag',
          whatIsHappening: 'JavaScript payload stored in database',
          whyCanThisHappen: 'Missing HTML entity encoding',
          whatShouldYouNotice: 'Unsanitized input tags',
          whatCouldBeImpact: 'Session cookie theft',
          howCanItBePrevented: 'Use DOMPurify and context escaping',
          realWorldLesson: 'Never render raw user HTML'
        }
      ],
      defenseStages: [
        {
          stageId: 'xdef-1',
          stageNumber: 1,
          title: 'Content Security Policy Enforcement',
          nodeId: 'x2',
          nodeType: 'defense_control',
          description: 'Browser blocks inline script execution',
          whatIsHappening: 'CSP directive script-src self prevents foreign scripts',
          whyCanThisHappen: 'Security headers enforce execution boundaries',
          whatShouldYouNotice: 'CSP violation report in console',
          whatCouldBeImpact: 'Zero unauthorized code execution',
          howCanItBePrevented: 'Enforce strict CSP and HttpOnly cookies',
          realWorldLesson: 'Defense-in-depth neutralizes residual vulnerabilities'
        }
      ]
    };

    const res = await request(app)
      .post('/api/simulations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(payload.title);
    newlyCreatedSimulationId = res.body.data._id;
  });

  it('POST /api/simulations - rejects non-admin authoring attempt with 403', async () => {
    const res = await request(app)
      .post('/api/simulations')
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        title: 'Unauthorized Simulation',
        description: 'Should fail with 403',
        category: 'phishing'
      });

    expect(res.status).toBe(403);
  });

  it('PUT /api/simulations/:id - allows admin to update simulation', async () => {
    const res = await request(app)
      .put(`/api/simulations/${newlyCreatedSimulationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Updated description through automated test suite.'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated description through automated test suite.');
  });

  it('DELETE /api/simulations/:id - allows admin to delete simulation', async () => {
    const res = await request(app)
      .delete(`/api/simulations/${newlyCreatedSimulationId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    newlyCreatedSimulationId = '';
  });
});
