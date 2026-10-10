import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { LearningModule } from '../src/models/LearningModule.js';
import { LearningResource } from '../src/models/LearningResource.js';

describe('CyberShield Visual Learning Hub Tests', () => {
  let adminToken = '';
  let learnerToken = '';
  let testModuleId = '';
  let testResourceId = '';
  let newlyCreatedResourceId = '';

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

    // Grab a test module
    const firstMod = await LearningModule.findOne({ isPublished: true });
    expect(firstMod).toBeDefined();
    testModuleId = firstMod._id.toString();

    // Grab a seeded resource for that module or any module
    let firstRes = await LearningResource.findOne({ module: testModuleId });
    if (!firstRes) {
      firstRes = await LearningResource.findOne({});
      testModuleId = firstRes.module.toString();
    }
    expect(firstRes).toBeDefined();
    testResourceId = firstRes._id.toString();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Visual Learning Resource Retrieval', () => {
    it('retrieves visual resources for a valid module', async () => {
      const res = await request(app).get(`/api/modules/${testModuleId}/resources`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.resources)).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalResources).toBeGreaterThanOrEqual(1);
    });

    it('attaches individual progress when student is authenticated', async () => {
      const res = await request(app)
        .get(`/api/modules/${testModuleId}/resources`)
        .set('Authorization', `Bearer ${learnerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const firstResource = res.body.data.resources[0];
      expect(firstResource.progress).toBeDefined();
      expect(typeof firstResource.progress.isCompleted).toBe('boolean');
    });

    it('returns 404 when querying resources for a non-existent module', async () => {
      const nonExistentId = '65f000000000000000000099';
      const res = await request(app).get(`/api/modules/${nonExistentId}/resources`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('retrieves a single resource by its specific ID', async () => {
      const res = await request(app).get(`/api/resources/${testResourceId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testResourceId);
      expect(res.body.data.title).toBeDefined();
    });
  });

  describe('2. Student Progress Tracking', () => {
    it('successfully records progress and marks resource as completed', async () => {
      const res = await request(app)
        .post(`/api/resources/${testResourceId}/progress`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          lastPosition: 120,
          completionPercentage: 100,
          isCompleted: true,
          notes: 'Completed interactive simulation'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCompleted).toBe(true);
      expect(res.body.data.completionPercentage).toBe(100);
    });

    it('retrieves the authenticated student overall visual learning history', async () => {
      const res = await request(app)
        .get('/api/resources/progress/my')
        .set('Authorization', `Bearer ${learnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.progress)).toBe(true);
      expect(res.body.data.totalTracked).toBeGreaterThanOrEqual(1);
    });

    it('rejects unauthenticated progress submissions', async () => {
      const res = await request(app)
        .post(`/api/resources/${testResourceId}/progress`)
        .send({
          lastPosition: 50,
          completionPercentage: 50
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Administrative Governance & Role-Based Access Control', () => {
    it('allows an administrator to create a new visual learning resource', async () => {
      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Automated Test Interactive Terminal Simulation',
          description: 'A mock network interface testing command injection detection rules.',
          module: testModuleId,
          type: 'simulation',
          simulationType: 'firewall',
          simulationConfig: { defaultRules: [] },
          duration: '4 min',
          difficulty: 'intermediate',
          provider: 'Automated Testing Lab',
          isPublished: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      newlyCreatedResourceId = res.body.data._id;
    });

    it('blocks a learner from creating a learning resource', async () => {
      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          title: 'Unauthorized Resource Injection',
          description: 'This should be strictly prohibited for regular learners.',
          module: testModuleId,
          type: 'video'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('allows administrator to update resource metadata', async () => {
      const res = await request(app)
        .put(`/api/resources/${newlyCreatedResourceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Interactive Terminal Simulation Title'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Interactive Terminal Simulation Title');
    });

    it('allows administrator to delete a learning resource', async () => {
      const res = await request(app)
        .delete(`/api/resources/${newlyCreatedResourceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const checkRes = await request(app).get(`/api/resources/${newlyCreatedResourceId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
