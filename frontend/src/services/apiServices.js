import axiosClient from '../api/axiosClient';

// Topic Services
export const topicService = {
  getAll: (params) => axiosClient.get('/topics', { params }),
  getById: (id) => axiosClient.get(`/topics/${id}`),
  create: (data) => axiosClient.post('/topics', data),
  update: (id, data) => axiosClient.put(`/topics/${id}`, data),
  delete: (id) => axiosClient.delete(`/topics/${id}`)
};

// Module Services
export const moduleService = {
  getAll: (params) => axiosClient.get('/modules', { params }),
  getById: (id) => axiosClient.get(`/modules/${id}`),
  complete: (id) => axiosClient.post(`/modules/${id}/complete`),
  create: (data) => axiosClient.post('/modules', data),
  update: (id, data) => axiosClient.put(`/modules/${id}`, data),
  delete: (id) => axiosClient.delete(`/modules/${id}`)
};

// Quiz Services
export const quizService = {
  getAll: (params) => axiosClient.get('/quizzes', { params }),
  getById: (id) => axiosClient.get(`/quizzes/${id}`),
  create: (data) => axiosClient.post('/quizzes', data),
  update: (id, data) => axiosClient.put(`/quizzes/${id}`, data),
  delete: (id) => axiosClient.delete(`/quizzes/${id}`),
  getQuestions: (quizId) => axiosClient.get(`/quizzes/${quizId}/questions`),
  createQuestion: (quizId, data) => axiosClient.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion: (id, data) => axiosClient.put(`/questions/${id}`, data),
  deleteQuestion: (id) => axiosClient.delete(`/questions/${id}`)
};

// Attempt Services
export const attemptService = {
  startAttempt: (quizId) => axiosClient.post(`/quizzes/${quizId}/attempts`),
  submitAttempt: (attemptId, answers) => axiosClient.post(`/attempts/${attemptId}/submit`, { answers }),
  getMyAttempts: (params) => axiosClient.get('/attempts/my', { params }),
  getAttemptById: (attemptId) => axiosClient.get(`/attempts/${attemptId}`),
  getQuizAttemptsReport: (quizId, params) => axiosClient.get(`/quizzes/${quizId}/attempts`, { params })
};

// Progress Services
export const progressService = {
  getMyProgress: () => axiosClient.get('/progress/my')
};

// User Management Services (Admin)
export const userService = {
  getAll: (params) => axiosClient.get('/users', { params }),
  getById: (id) => axiosClient.get(`/users/${id}`),
  update: (id, data) => axiosClient.patch(`/users/${id}`, data)
};

// Dashboard Services
export const dashboardService = {
  getLearner: () => axiosClient.get('/dashboard/learner'),
  getInstructor: () => axiosClient.get('/dashboard/instructor'),
  getAdmin: () => axiosClient.get('/dashboard/admin')
};

// Analytics Services
export const analyticsService = {
  getQuizPerformance: () => axiosClient.get('/analytics/quiz-performance')
};

// Public Platform Stats (Landing Page)
export const publicStatsService = {
  getStats: () => axiosClient.get('/public-stats')
};

// Visual Learning Resources Services
export const resourceService = {
  getByModule: (moduleId, params) => axiosClient.get(`/modules/${moduleId}/resources`, { params }),
  getById: (id) => axiosClient.get(`/resources/${id}`),
  saveProgress: (id, data) => axiosClient.post(`/resources/${id}/progress`, data),
  getMyProgress: () => axiosClient.get('/resources/progress/my'),
  getAllAdmin: (params) => axiosClient.get('/resources/admin/all', { params }),
  create: (data) => axiosClient.post('/resources', data),
  update: (id, data) => axiosClient.put(`/resources/${id}`, data),
  delete: (id) => axiosClient.delete(`/resources/${id}`)
};

// "Watch How It Happens" Attack Simulation Services
export const simulationService = {
  getAll: (params) => axiosClient.get('/simulations', { params }),
  getById: (id) => axiosClient.get(`/simulations/${id}`),
  startSession: (id, data) => axiosClient.post(`/simulations/${id}/session`, data),
  updateProgress: (sessionId, data) => axiosClient.patch(`/simulations/sessions/${sessionId}/progress`, data),
  completeSession: (sessionId, data) => axiosClient.post(`/simulations/sessions/${sessionId}/complete`, data),
  getMyProgress: () => axiosClient.get('/simulations/progress/my'),
  getAllAdmin: (params) => axiosClient.get('/simulations/admin/all', { params }),
  create: (data) => axiosClient.post('/simulations', data),
  update: (id, data) => axiosClient.put(`/simulations/${id}`, data),
  delete: (id) => axiosClient.delete(`/simulations/${id}`)
};

