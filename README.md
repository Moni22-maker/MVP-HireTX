# HireTX – National Employability Readiness System

## Project Overview
- **Name**: HireTX National Employability Readiness System
- **Version**: 3.0 (Production-Ready)
- **Goal**: A scalable, performance-based simulation platform that measures candidate employability using the TBCLM framework
- **Platform**: Cloudflare Pages + D1 Database

## Live URL
- **Development**: http://localhost:3000
- **Public**: https://3000-i57puxnjma9uefwnqhsp6-b32ec7bb.sandbox.novita.ai

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Candidate (HR) | candidate@hiretx.gov | Password123! |
| Candidate (IT) | john@hiretx.gov | Password123! |
| Evaluator | evaluator@hiretx.gov | Password123! |
| Admin | admin@hiretx.gov | Password123! |

## Features Implemented

### ✅ Authentication & RBAC
- JWT-based authentication with bcrypt-style password hashing (PBKDF2 for CF Workers)
- 4 roles: Candidate, Evaluator, Admin, Super Admin
- Role-based route protection middleware
- Registration with specialization selection

### ✅ TBCLM Scoring Engine
- **T** – Technical Competency (30%)
- **B** – Behavioral Skills (25%)
- **C** – Cognitive & Analytical Ability (20%)
- **L** – Leadership & Professionalism (15%)
- **M** – Market Readiness (10%)
- Formula: HireTX Index = T×0.30 + B×0.25 + C×0.20 + L×0.15 + M×0.10
- Readiness levels: 90-100 Ready | 75-89 Prepared | 60-74 Developing | <60 Needs Dev

### ✅ 52 Simulations
- **26 Human Resources**: HR-001 to HR-026 (Beginner to Expert)
- **26 Computer Science/IT**: IT-001 to IT-026 (Beginner to Expert)
- Task types: Multiple Choice, Text Response, Scenario Decision, Case Analysis
- Auto-scoring with keyword matching and AI-assisted text scoring
- Rubrics system for evaluator guidance

### ✅ Dashboard Modules
- **Candidate**: HireTX Index circle, TBCLM radar chart, strengths/weaknesses, available simulations, recent submissions
- **Admin**: Platform stats, TBCLM averages bar chart, readiness doughnut, sim performance, user management, audit logs
- **Evaluator**: Pending queue, review interface with per-task scoring, rubric panel, score override

### ✅ Simulation Engine
- Countdown timer with warning states
- Task navigation with answered/current indicators
- Multiple choice with visual selection
- Text response with word count tracking
- Exit confirmation with progress save
- Submit with unanswered task warning
- Auto-submit on time expiration

### ✅ PDF Report Generation
- Client-side PDF via jsPDF
- HireTX branding and logo
- Candidate info, HireTX Index, TBCLM breakdown bars
- Readiness level, strengths, recommendations
- Professional government-style layout

### ✅ Analytics
- Skill gap analysis by specialization
- Trending simulations
- Top performers leaderboard
- Readiness trends line chart (30-day)

## Tech Stack
- **Frontend**: Vanilla JavaScript SPA + Tailwind CSS CDN + Chart.js + jsPDF
- **Backend**: Hono framework (TypeScript) on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: JWT with HMAC-SHA-256 (Web Crypto API)
- **Deployment**: Cloudflare Pages

## Data Architecture
### Core Tables
- `users` – Candidates, Evaluators, Admins with RBAC
- `simulations` – 52 simulations with metadata
- `tasks` – Per-simulation tasks with TBCLM axis mapping
- `submissions` – Attempt tracking with scores and TBCLM results
- `scores` – Per-task scoring records
- `tbclm_axis` – TBCLM breakdown records with index and readiness
- `rubrics` – Evaluation rubrics for task scoring
- `reports` – Report generation audit trail
- `audit_logs` – System-wide audit trail

## API Endpoints
### Auth
- `POST /api/auth/register` – New account
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Current user
- `PUT /api/auth/profile` – Update profile

### Simulations
- `GET /api/simulations` – List (filtered, paginated)
- `GET /api/simulations/:id` – Single sim with tasks
- `POST /api/simulations` – Create (admin)
- `POST /api/simulations/:id/start` – Start attempt
- `POST /api/simulations/:id/submit` – Submit with scoring

### Dashboard
- `GET /api/dashboard/candidate` – Candidate dashboard
- `GET /api/dashboard/admin` – Admin dashboard
- `GET /api/dashboard/evaluator` – Evaluator queue
- `GET /api/dashboard/submission/:id` – Submission detail
- `POST /api/dashboard/submission/:id/score` – Evaluator scoring
- `GET /api/dashboard/analytics` – Platform analytics
- `GET /api/dashboard/report/:userId` – Report data
- `GET /api/dashboard/users` – User management
- `PUT /api/dashboard/users/:id/role` – Change user role

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active (Local Dev)
- **Last Updated**: 2026-03-04
- **DB**: Cloudflare D1 (local mode)

## Starting the Service
```bash
# Build
npm run build

# Apply migrations
npx wrangler d1 migrations apply hiretx-production --local

# Start with PM2
pm2 start ecosystem.config.cjs

# Test health
curl http://localhost:3000/api/health
```
