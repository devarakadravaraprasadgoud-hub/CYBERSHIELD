import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { TopicsPage } from '../pages/public/TopicsPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Learner Pages
import { LearnerDashboard } from '../pages/learner/LearnerDashboard';
import { TopicDetailsPage } from '../pages/learner/TopicDetailsPage';
import { ModuleListPage } from '../pages/learner/ModuleListPage';
import { ModuleReaderPage } from '../pages/learner/ModuleReaderPage';
import { QuizInstructionsPage } from '../pages/learner/QuizInstructionsPage';
import { InteractiveQuizPage } from '../pages/learner/InteractiveQuizPage';
import { QuizResultsPage } from '../pages/learner/QuizResultsPage';
import { QuizHistoryPage } from '../pages/learner/QuizHistoryPage';
import { ProgressPage } from '../pages/learner/ProgressPage';
import { ProfilePage } from '../pages/learner/ProfilePage';
import { WatchHowItHappensPage } from '../pages/learner/WatchHowItHappensPage';
import { SimulationStudioPage } from '../pages/learner/SimulationStudioPage';

// Instructor Pages
import { InstructorDashboard } from '../pages/instructor/InstructorDashboard';
import { InstructorModulesPage } from '../pages/instructor/InstructorModulesPage';
import { ModuleEditorPage } from '../pages/instructor/ModuleEditorPage';
import { InstructorQuizzesPage } from '../pages/instructor/InstructorQuizzesPage';
import { QuestionManagerPage } from '../pages/instructor/QuestionManagerPage';
import { LearnerPerformancePage } from '../pages/instructor/LearnerPerformancePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { TopicManagementPage } from '../pages/admin/TopicManagementPage';
import { ModuleManagementPage } from '../pages/admin/ModuleManagementPage';
import { ResourceManagementPage } from '../pages/admin/ResourceManagementPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { QuizReportsPage } from '../pages/admin/QuizReportsPage';
import { PlatformAnalyticsPage } from '../pages/admin/PlatformAnalyticsPage';
import { AttackSimulationManagementPage } from '../pages/admin/AttackSimulationManagementPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/topics/:id" element={<TopicDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Learner Dashboard Routes */}
      <Route
        path="/learner"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/learner/dashboard" replace />} />
        <Route path="dashboard" element={<LearnerDashboard />} />
        <Route path="modules" element={<ModuleListPage />} />
        <Route path="modules/:id" element={<ModuleReaderPage />} />
        <Route path="quizzes/:id/instructions" element={<QuizInstructionsPage />} />
        <Route path="quizzes/:quizId/take" element={<InteractiveQuizPage />} />
        <Route path="quizzes/results/:attemptId" element={<QuizResultsPage />} />
        <Route path="history" element={<QuizHistoryPage />} />
        <Route path="watch-how-it-happens" element={<WatchHowItHappensPage />} />
        <Route path="watch-how-it-happens/:id" element={<SimulationStudioPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Instructor Dashboard Routes */}
      <Route
        path="/instructor"
        element={
          <RoleRoute allowedRoles={['instructor', 'admin']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/instructor/dashboard" replace />} />
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="modules" element={<InstructorModulesPage />} />
        <Route path="modules/create" element={<ModuleEditorPage />} />
        <Route path="modules/edit/:id" element={<ModuleEditorPage />} />
        <Route path="resources" element={<ResourceManagementPage />} />
        <Route path="attack-simulations" element={<AttackSimulationManagementPage />} />
        <Route path="quizzes" element={<InstructorQuizzesPage />} />
        <Route path="quizzes/:quizId/questions" element={<QuestionManagerPage />} />
        <Route path="performance" element={<LearnerPerformancePage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="topics" element={<TopicManagementPage />} />
        <Route path="modules" element={<ModuleManagementPage />} />
        <Route path="resources" element={<ResourceManagementPage />} />
        <Route path="attack-simulations" element={<AttackSimulationManagementPage />} />
        <Route path="quizzes" element={<InstructorQuizzesPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="reports" element={<QuizReportsPage />} />
        <Route path="analytics" element={<PlatformAnalyticsPage />} />
      </Route>
    </Routes>
  );
};
