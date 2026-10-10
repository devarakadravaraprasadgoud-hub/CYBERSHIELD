# CyberShield — Cybersecurity Awareness Platform

> **A production-ready, full-stack MERN (MongoDB, Express.js, React, Node.js) web platform engineered to transform the human firewall through interactive learning modules, threat defense simulations, and rigorous server-side evaluated quizzes.**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-cyan.svg)](#technology-stack)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Key Capabilities & Role Ecosystem](#key-capabilities--role-ecosystem)
3. [Technology Stack](#technology-stack)
4. [Architecture & Folder Structure](#architecture--folder-structure)
5. [Prerequisites](#prerequisites)
6. [Quick Start & Installation](#quick-start--installation)
7. [Environment Configuration](#environment-configuration)
8. [Database Seeding & Default Credentials](#database-seeding--default-credentials)
9. [REST API Documentation](#rest-api-documentation)
10. [Automated Testing](#automated-testing)
11. [Deployment Guide](#deployment-guide)
12. [Security Architecture & Guarantees](#security-architecture--guarantees)

---

## 1. Platform Overview

Over 82% of modern data breaches exploit the human element—through spear phishing, credential stuffing, living-off-the-land techniques, or misconfigured multi-factor authentication.

**CyberShield** is an enterprise-grade cybersecurity awareness platform built to provide structured, bite-sized lessons, timed assessment simulations, and instantaneous educational feedback without client-side answer leakage.

---

## 2. Key Capabilities & Role Ecosystem

The platform enforces Role-Based Access Control (RBAC) across three distinct user roles:

### A. Learner (Defense Cadet)
* **Interactive Terminal Dashboard:** Live statistics on attempted quizzes, average score, completed modules, and unlocked achievement badges.
* **Curriculum Browsing:** Multi-category search and difficulty filtering (Beginner, Intermediate, Advanced) across core cybersecurity topics.
* **Module Reader:** Step-by-step structured lessons with actionable callouts (Info, Warning, Alert, Best Practice Tips) and explicit completion tracking.
* **Timed Quiz Engine:** Client countdown timer, question matrix navigation, flagged-for-review markings, and submission safeguards.
* **Immediate Feedback & Explanations:** Full post-submission review displaying chosen answer, verified correct answer, and thorough technical rationales.
* **Historical Audit Logs:** Detailed past attempt records with time spent, percentage scores, and pass/fail indicators.
* **Gamification:** Earn milestone badges (*Welcome Cadet*, *Knowledge Seeker*, *Cyber Guardian*, *Flawless Defense*, etc.).

### B. Instructor (Curriculum Author)
* **Instructor Command Dashboard:** Overview of owned modules, managed quizzes, total question count, and learner attempt statistics.
* **Module Authoring Studio:** Dynamic multi-section builder with rich text, section headings, and callout configuration.
* **Quiz Management:** Set custom time limits (minutes), passing percentages, randomize questions, and toggle draft/published states.
* **Question Workshop:** Add and edit single-choice questions with dynamic option keys, verified single-correct selection, and educational explanations.
* **Cohort Telemetry:** Review assessment submissions exclusively for quizzes they own.

### C. Administrator (Root Security Officer)
* **Global Security Center:** Platform-wide oversight of total registered users, active topics, modules, pass rates, and recent activity.
* **Topic Directory Management:** Create, edit, and delete top-level cybersecurity topics and domain categorizations.
* **Global Module & Quiz Governance:** Supervise and toggle publication states across all instructor-authored materials.
* **User Directory:** Audit user accounts, suspend or activate access, and promote learners to instructors.
* **Visual Telemetry (Recharts):** Interactive charts for cohort score distribution, quiz performance rankings, and a 14-day evaluation activity timeline.

---

## 3. Technology Stack

### Frontend
* **React.js 18** with **Vite** for optimized HMR and bundling.
* **Tailwind CSS** with a custom dark cybersecurity color palette (`#0a0f1d`, `#131d35`, `#06b6d4`, `#00f0ff`).
* **Lucide React** for clean, modern security iconography.
* **React Router DOM v6** for nested layouts, protected routes, and role-based guards.
* **Axios** with request/response interceptors for automatic JWT attachment and refresh token renewal.
* **React Hook Form** for responsive, validated forms.
* **Recharts** for responsive telemetry data visualization.
* **Vitest & React Testing Library** for automated component and integration testing.

### Backend
* **Node.js (v20+)** and **Express.js** in ESM (ECMAScript Modules) architecture.
* **MongoDB** with **Mongoose** for schema validation, indexing, and relations.
* **JWT (JSON Web Tokens)** for stateless authentication (Access Tokens + secure Refresh Tokens).
* **bcryptjs** (salted hashing with work factor 10) for credential protection.
* **Zod** for schema validation on all incoming request payloads.
* **Helmet** for secure HTTP headers.
* **CORS** configured with explicit client whitelisting and credentials support.
* **express-rate-limit** for brute-force prevention on authentication routes.
* **Centralized Error Handling** with custom error mapping and safe production output.

---

## 4. Architecture & Folder Structure

```
AWARE - CYBER/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment validation (Zod) and MongoDB connection
│   │   ├── models/          # Mongoose Schemas (User, Topic, Module, Quiz, Question, Attempt, Progress, Achievement)
│   │   ├── controllers/     # Business logic handlers
│   │   ├── routes/          # Express REST endpoint declarations
│   │   ├── middleware/      # Auth (JWT), Role (RBAC), Rate limiting, Zod validation, Error handling
│   │   ├── services/        # Quiz scoring engine & progress gamification
│   │   ├── validators/      # Zod validation schemas
│   │   ├── utils/           # API response helpers and token management
│   │   ├── scripts/         # Comprehensive database seed script
│   │   ├── app.js           # Express app setup and middleware configuration
│   │   └── server.js        # Server boot and graceful shutdown listeners
│   ├── tests/               # Vitest integration tests with Supertest
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with interceptors
│   │   ├── components/
│   │   │   ├── common/      # Navbar, Sidebar, Footer, Modal, ConfirmDialog, StatCard, Badge, Pagination
│   │   │   └── quiz/        # QuestionCard, QuizTimer, QuizNavGrid
│   │   ├── context/         # AuthContext and ToastContext
│   │   ├── hooks/           # useAuth and useToast hooks
│   │   ├── layouts/         # MainLayout (public) and DashboardLayout (authenticated)
│   │   ├── pages/
│   │   │   ├── public/      # LandingPage, AboutPage, TopicsPage, LoginPage, RegisterPage, Unauthorized, NotFound
│   │   │   ├── learner/     # Dashboard, ModuleReader, QuizTake, QuizResults, QuizHistory, Progress, Profile
│   │   │   ├── instructor/  # Dashboard, ModuleEditor, QuizManager, QuestionManager, PerformanceReports
│   │   │   └── admin/       # Dashboard, TopicManagement, UserManagement, Analytics
│   │   ├── routes/          # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── services/        # Frontend API services layer
│   │   ├── test/            # Vitest unit tests for components
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json             # Root unified workspace scripts
└── README.md
```

---

## 5. Prerequisites

Before running the application, ensure the following are installed:
* **Node.js:** v18.0.0 or later (v20+ recommended)
* **npm:** v9.0.0 or later
* **MongoDB:** A locally running MongoDB instance (e.g. `mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

---

## 6. Quick Start & Installation

Clone or open the repository workspace and install all dependencies:

### Step 1: Install Dependencies
```bash
# From root directory:
npm run install:all
```
*(Or navigate to `backend` and `frontend` folders individually and run `npm install`)*

---

## 7. Environment Configuration

### Backend Configuration
Create `backend/.env` (a template is provided in `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/cybershield_db
JWT_ACCESS_SECRET=cybershield_super_secure_access_secret_2026_x!9qZ
JWT_REFRESH_SECRET=cybershield_super_secure_refresh_secret_2026_w@4kL
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@cybershield.local
ADMIN_INITIAL_PASSWORD=AdminSecurePass123!
```

### Frontend Configuration
Create `frontend/.env` (a template is provided in `frontend/.env.example`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 8. Database Seeding & Default Credentials

Run the automated backend seed script to populate:
* **8 Core Topics:** Password Security, Phishing, Malware, MFA, Web App Security, Network Security, Data Privacy, and Incident Response.
* **12 Comprehensive Learning Modules:** Structured with headings, takeaways, and callout boxes.
* **5 Quizzes with 25 Verified Questions:** Covering Diceware entropy, credential stuffing, IDN homographs, Living-off-the-Land, FIDO2/WebAuthn, and SQL injection.
* **8 Gamified Defense Badges.**
* **3 Default Role Accounts for Testing.**

```bash
npm run seed
```

### Default Local Development Accounts
| Role | Email Address | Password | Clearance Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cybershield.local` | `AdminSecurePass123!` | Global Governance & Directory |
| **Instructor** | `instructor@cybershield.local` | `InstructorPass123!` | Curriculum Author & Cohort Reports |
| **Learner** | `learner@cybershield.local` | `LearnerPass123!` | Interactive Assessments & Progress |

> *Tip: The Login page includes one-click demo account buttons to instantly test each role without typing.*

---

## 9. Starting the Applications

### Start Backend API Server
```bash
npm run dev:backend
# Starts Express REST API at http://localhost:5000
# Health check available at: http://localhost:5000/api/health
```

### Start Frontend Application
```bash
npm run dev:frontend
# Starts Vite React development server at http://localhost:5173
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 10. REST API Documentation

All API responses follow a predictable JSON schema:
`{ "success": true, "message": "...", "data": ... }`

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new account (`learner` or `instructor`). Administrator accounts are strictly rejected here.
* `POST /api/auth/login` — Authenticate credentials; returns access token and sets HTTP-only refresh cookie.
* `POST /api/auth/logout` — Terminate session and invalidate refresh token.
* `GET /api/auth/me` — Fetch current authenticated user profile.
* `POST /api/auth/refresh` — Issue fresh access token using refresh token.
* `PATCH /api/auth/profile` — Update user profile details (bio, title, organization).

### Topics (`/api/topics`)
* `GET /api/topics` — List topics with search, difficulty, category, and pagination (public only sees published).
* `GET /api/topics/:id` — Topic details with associated modules and quizzes.
* `POST /api/topics` — Create topic *(Admin only)*.
* `PUT /api/topics/:id` — Update topic *(Admin only)*.
* `DELETE /api/topics/:id` — Delete topic and cascaded references *(Admin only)*.

### Learning Modules (`/api/modules`)
* `GET /api/modules` — List modules with filters.
* `GET /api/modules/:id` — Full module reader with structured sections.
* `POST /api/modules/:id/complete` — Mark module complete for logged-in learner.
* `POST /api/modules` — Create module *(Admin & Instructor)*.
* `PUT /api/modules/:id` — Update module *(Admin & Creator Instructor)*.
* `DELETE /api/modules/:id` — Delete module *(Admin & Creator Instructor)*.

### Quizzes & Questions (`/api/quizzes`)
* `GET /api/quizzes` — List quizzes with difficulty, pass percentage, and user score stats.
* `GET /api/quizzes/:id` — Quiz briefing with question counts.
* `POST /api/quizzes` — Create quiz *(Admin & Instructor)*.
* `PUT /api/quizzes/:id` — Update quiz *(Admin & Creator Instructor)*.
* `DELETE /api/quizzes/:id` — Delete quiz *(Admin & Creator Instructor)*.
* `GET /api/quizzes/:quizId/questions` — Retrieve questions. **CRITICAL SECURITY GUARANTEE:** Learners never receive `correctAnswerId` or `explanation` from this route.
* `POST /api/quizzes/:quizId/questions` — Add question *(Admin & Creator Instructor)*.
* `PUT /api/questions/:id` — Update question *(Admin & Creator Instructor)*.
* `DELETE /api/questions/:id` — Delete question *(Admin & Creator Instructor)*.

### Quiz Attempts & Evaluations (`/api/attempts`)
* `POST /api/quizzes/:quizId/attempts` — Start a new evaluation attempt with server timestamp.
* `POST /api/attempts/:attemptId/submit` — Submit answers (`[{ questionId, selectedOptionId }]`). **Server calculates the final score, validates ownership, blocks duplicates, records snapshots, updates progress, and returns feedback.**
* `GET /api/attempts/my` — Paginated history of user's past attempts.
* `GET /api/attempts/:attemptId` — Audit inspection of an attempt (Owner, Admin, or Quiz Instructor).

### Progress & Telemetry (`/api/progress`, `/api/dashboard`, `/api/analytics`)
* `GET /api/progress/my` — Learner progress percentages and unlocked badges.
* `GET /api/dashboard/learner` — Personalized learner dashboard metrics and recommendations.
* `GET /api/dashboard/instructor` — Instructor authoring metrics and student submissions.
* `GET /api/dashboard/admin` — Global platform metrics, user counts, and recent activities.
* `GET /api/analytics/quiz-performance` — Aggregated Recharts telemetry: cohort distributions, quiz pass rates, and timeline trends.
* `GET /api/public-stats` — Public aggregate statistics for landing page.

---

## 11. Automated Testing

The platform includes comprehensive test suites across both backend and frontend layers:

```bash
# Run all tests (backend + frontend)
npm test

# Run backend API tests only
npm run test:backend

# Run frontend unit & component tests only
npm run test:frontend
```

### Coverage Highlights:
* **Backend:** Registration validation, password hashing verification, unauthorized route blocking, RBAC permission enforcement, topic/quiz CRUD, question management, question sanitization (preventing answer leakage), server-side evaluation, attempt ownership checks, duplicate submission prevention, and dashboard metrics accuracy.
* **Frontend:** Form rendering and submission, option selection state, review mode with explanations, difficulty badges, and metric cards.

---

## 12. Deployment Guide

### Backend Deployment (Render / Railway / Fly.io)
1. Set the root directory to `backend`.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Set environment variables (`PORT`, `NODE_ENV=production`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`).
5. Run `npm run seed` once using the hosting provider's shell to seed the production database.

### Frontend Deployment (Vercel / Netlify)
1. Set root directory to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_BASE_URL=https://your-backend-domain.com/api`

---

## 13. Security Architecture & Guarantees

* **Zero-Knowledge Quiz Delivery:** Question retrieval routes for learners sanitize options and strip correct answers and explanations before transmitting to browsers.
* **Server-Authoritative Evaluation:** The backend scoring service independently maps user option IDs against database answers, calculates points, and prevents manipulation.
* **Mass Assignment & Admin Protection:** Public registration strictly denies the `admin` role at both Zod validation and controller layers.
* **Session Integrity:** Uses short-lived access tokens and HttpOnly, SameSite cookies for refresh operations.
* **Rate Limiting:** Protects `/api/auth/login` and `/api/auth/register` against brute-force password guessing.
* **Defensive Audits:** Completed attempts freeze immutable answer snapshots preserving historical audit accuracy even if a quiz is subsequently modified.

---

## 14. License
Distributed under the **MIT License**. Engineered for cybersecurity education and awareness literacy.
