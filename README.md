# HireTX – National Employability Readiness System

## Project Overview
- **Name**: HireTX Platform
- **Goal**: Assess candidates' employability readiness using the TBCLM Framework
- **Tech Stack**: Hono + TypeScript + Cloudflare D1 + TailwindCSS + Chart.js

## Features Completed
- ✅ **Landing Page** — Showcases TBCLM framework and readiness levels
- ✅ **Authentication** — JWT-based login/register with role management
- ✅ **Candidate Dashboard** — HireTX Index™, TBCLM radar chart, available simulations, submission history
- ✅ **Admin Dashboard** — Platform stats, TBCLM averages, score distribution, readiness distribution, simulation performance, recent users
- ✅ **Simulation Engine** — 52 simulations (26 HR + 26 IT), multiple choice + text response tasks, TBCLM scoring
- ✅ **Simulation Results** — Full TBCLM breakdown, strengths/weaknesses, recommendations, radar chart
- ✅ **Evaluator Dashboard** — Pending review queue, evaluation panel with per-task scoring
- ✅ **Analytics Page** — Skill gap analysis, trending simulations, top performers, readiness trends (Admin)
- ✅ **User Management** — Filter/search users, role management (Admin)
- ✅ **Reports Page** — Personal TBCLM profile, submission history, PDF export
- ✅ **Profile Page** — Update name/specialization, view account information
- ✅ **PDF Report Generation** — jsPDF-based downloadable assessment report

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| GET | /api/simulations | List simulations |
| GET | /api/simulations/:id | Get simulation detail |
| POST | /api/simulations | Create simulation (admin) |
| POST | /api/simulations/:id/start | Start simulation |
| POST | /api/simulations/:id/submit | Submit simulation |
| GET | /api/dashboard/candidate | Candidate dashboard data |
| GET | /api/dashboard/admin | Admin dashboard data |
| GET | /api/dashboard/evaluator | Evaluator queue |
| GET | /api/dashboard/submission/:id | Submission detail |
| POST | /api/dashboard/submission/:id/score | Score submission |
| GET | /api/dashboard/analytics | Analytics (admin) |
| GET | /api/dashboard/report/:userId | User report |
| GET | /api/dashboard/users | User management (admin) |
| PUT | /api/dashboard/users/:id/role | Change user role (admin) |

## Demo Credentials (Password: `Password123!`)
| Role | Email |
|------|-------|
| Administrator | admin@hiretx.gov |
| Evaluator | evaluator@hiretx.gov |
| Candidate (HR) | candidate@hiretx.gov |
| Candidate (IT) | john@hiretx.gov |

## Data Architecture
- **Storage**: Cloudflare D1 (SQLite)
- **Tables**: users, simulations, tasks, submissions, scores, tbclm_axis, rubrics, reports, audit_logs
- **Scoring**: TBCLM Framework (T=30%, B=25%, C=20%, L=15%, M=10%)
- **Auth**: JWT with PBKDF2 password hashing (Web Crypto API)

## Bugs Fixed (v3.1)
1. **DB naming inconsistency** — wrangler.jsonc/package.json both now use `hiretx-production`
2. **Admin dashboard** — User role change now accessible by admin (not only super_admin)
3. **Reports page** — Fixed to use `/dashboard/report/:userId` endpoint with correct `best_result` data structure
4. **PDF Report** — Fixed to use `best_result` fields from report endpoint
5. **Simulations listing** — Candidates now see ALL simulations, sorted with their specialization first
6. **Available simulations on dashboard** — Shows all simulations with specialization sorting
7. **Profile page** — Now fetches fresh profile data from API for accurate timestamps
8. **User management search** — Fixed debounce function for search input
9. **Reports table** — Fixed column data handling for different endpoint structures
10. **JS Syntax error** — Fixed extra closing brace in app.js

## Deployment
- **Platform**: Cloudflare Pages
- **Local Dev**: `npm run setup` (build + DB reset)
- **Start**: `pm2 start ecosystem.config.cjs`
- **DB Reset**: `npm run db:reset`
- **Status**: ✅ Production Ready
- **Last Updated**: 2026-03-05
